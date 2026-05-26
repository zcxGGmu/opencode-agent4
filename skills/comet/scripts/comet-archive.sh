#!/bin/bash
# Comet Archive — automates the archive phase in one command
# Usage: comet-archive.sh <change-name> [--dry-run]
# Exit 0 = archive complete, exit 1 = fatal error

set -euo pipefail

red() { echo -e "\033[31m$1\033[0m" >&2; }
green() { echo -e "\033[32m$1\033[0m" >&2; }
yellow() { echo -e "\033[33m$1\033[0m" >&2; }

DRY_RUN=0
if [[ "${2:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

# Input validation
validate_change_name() {
  local name="$1"
  if [ -z "$name" ]; then
    red "FATAL: Change name cannot be empty"
    exit 1
  fi
  if [[ ! "$name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    red "FATAL: Invalid change name: '$name'"
    red "Valid characters: a-z, A-Z, 0-9, -, _"
    exit 1
  fi
  if [[ "$name" =~ \.\. ]]; then
    red "FATAL: Change name cannot contain '..'"
    exit 1
  fi
}

CHANGE="$1"
validate_change_name "$CHANGE"

CHANGE_DIR="openspec/changes/$CHANGE"
YAML="$CHANGE_DIR/.comet.yaml"
SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0" 2>/dev/null || echo "$0")" 2>/dev/null || dirname "$0")" && pwd)"
STATE_SH="$SCRIPT_DIR/comet-state.sh"
TODAY=$(date +%Y-%m-%d)
ARCHIVE_NAME="${TODAY}-${CHANGE}"
ARCHIVE_DIR="openspec/changes/archive/${ARCHIVE_NAME}"

STEPS_OK=0
STEPS_TOTAL=0
OPENSPEC_ARCHIVE_RAN=0

step_ok() {
  green "  [OK] $1"
  STEPS_OK=$((STEPS_OK + 1))
  STEPS_TOTAL=$((STEPS_TOTAL + 1))
}

step_fail() {
  red "  [FAIL] $1"
  STEPS_TOTAL=$((STEPS_TOTAL + 1))
}

step_dry_run() {
  yellow "  [DRY-RUN] $1"
  STEPS_OK=$((STEPS_OK + 1))
  STEPS_TOTAL=$((STEPS_TOTAL + 1))
}

echo "=== Comet Archive: $CHANGE ===" >&2

# --- Step 1: Read .comet.yaml, extract paths ---

yaml_field() {
  local field="$1"
  if [ -f "$STATE_SH" ]; then
    bash "$STATE_SH" get "$CHANGE" "$field" 2>/dev/null
  else
    if [ -f "$YAML" ]; then
      local value
      value=$(grep "^${field}:" "$YAML" 2>/dev/null | sed "s/^${field}: *//" || true)
      value=$(strip_inline_comment "$value")
      strip_wrapping_quotes "$value"
    fi
  fi
}

strip_inline_comment() {
  local value="$1"
  printf '%s\n' "$value" | awk -v squote="'" '
    {
      out = ""
      quote = ""
      for (i = 1; i <= length($0); i++) {
        c = substr($0, i, 1)
        if (quote == "") {
          if (c == "\"" || c == squote) {
            quote = c
          } else if (c == "#" && (i == 1 || substr($0, i - 1, 1) ~ /[[:space:]]/)) {
            sub(/[[:space:]]+$/, "", out)
            print out
            next
          }
        } else if (c == quote) {
          quote = ""
        }
        out = out c
      }
      print out
    }
  '
}

strip_wrapping_quotes() {
  local value="$1"
  case "$value" in
    \"*\") printf '%s\n' "${value:1:${#value}-2}" ;;
    \'*\') printf '%s\n' "${value:1:${#value}-2}" ;;
    *) printf '%s\n' "$value" ;;
  esac
}

path_has_parent_segment() {
  local value="$1"
  case "/$value/" in
    */../*|*/..)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

path_is_absolute() {
  local value="$1"
  case "$value" in
    /*|~*|[A-Za-z]:*|\\\\*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

path_has_symlink_component() {
  local value="$1"
  local current=""
  local part

  IFS='/' read -r -a parts <<< "$value"
  for part in "${parts[@]}"; do
    [ -z "$part" ] && continue
    if [ -z "$current" ]; then
      current="$part"
    else
      current="$current/$part"
    fi
    if [ -L "$current" ]; then
      return 0
    fi
  done

  return 1
}

validate_managed_path() {
  local field="$1"
  local value="$2"
  local allowed_prefix=""

  if [ -z "$value" ] || [ "$value" = "null" ]; then
    return 0
  fi

  case "$field" in
    design_doc)
      allowed_prefix="docs/superpowers/specs/"
      ;;
    plan)
      allowed_prefix="docs/superpowers/plans/"
      ;;
    verification_report)
      allowed_prefix="docs/superpowers/reports/"
      ;;
    *)
      return 0
      ;;
  esac

  if path_is_absolute "$value" || path_has_parent_segment "$value"; then
    red "FATAL: unsafe $field path: $value"
    exit 1
  fi

  case "$value" in
    "$allowed_prefix"*) ;;
    *)
      red "FATAL: $field path must stay under $allowed_prefix: $value"
      exit 1
      ;;
  esac

  if path_has_symlink_component "$value"; then
    red "FATAL: $field path cannot include symlink components: $value"
    exit 1
  fi
}

if [ ! -f "$YAML" ]; then
  red "FATAL: .comet.yaml not found in $CHANGE_DIR/"
  exit 1
fi

DESIGN_DOC=$(yaml_field "design_doc")
PLAN_PATH=$(yaml_field "plan")
VERIFICATION_REPORT=$(yaml_field "verification_report")
BRANCH_STATUS=$(yaml_field "branch_status")
validate_managed_path "design_doc" "$DESIGN_DOC"
validate_managed_path "plan" "$PLAN_PATH"
validate_managed_path "verification_report" "$VERIFICATION_REPORT"

# --- Step 2: Validate entry state ---

PHASE_VAL=$(yaml_field "phase")
VERIFY_VAL=$(yaml_field "verify_result")
ARCHIVED_VAL=$(yaml_field "archived")

if [ "$PHASE_VAL" != "archive" ]; then
  red "FATAL: phase is '$PHASE_VAL', expected 'archive'"
  exit 1
fi

if [ "$VERIFY_VAL" != "pass" ]; then
  red "FATAL: verify_result is '$VERIFY_VAL', expected 'pass'. Run comet-verify first."
  exit 1
fi

if [ "$ARCHIVED_VAL" = "true" ]; then
  red "FATAL: change already archived"
  exit 1
fi

if [ -z "$VERIFICATION_REPORT" ] || [ "$VERIFICATION_REPORT" = "null" ] || [ ! -f "$VERIFICATION_REPORT" ]; then
  red "FATAL: verification_report must point to an existing report file before archive"
  exit 1
fi

if [ "$BRANCH_STATUS" != "handled" ]; then
  red "FATAL: branch_status must be handled before archive"
  exit 1
fi

step_ok "Entry state verified"

# --- Step 3: Check archive target ---

if [ -d "$ARCHIVE_DIR" ]; then
  red "FATAL: archive target already exists: $ARCHIVE_DIR"
  exit 1
fi

if [ -d "openspec/changes/$ARCHIVE_NAME" ]; then
  red "FATAL: active change already exists with archive name: $ARCHIVE_NAME"
  red "Archive marking would be ambiguous. Rename or resolve that active change before archiving $CHANGE."
  exit 1
fi

step_ok "Archive target available"

# --- Step 4: Merge delta specs through OpenSpec ---

sync_delta_specs() {
  local delta_root="$CHANGE_DIR/specs"
  if [ ! -d "$delta_root" ]; then
    return 0
  fi

  local has_delta_specs=0
  for delta_spec_dir in "$delta_root"/*/; do
    [ -d "$delta_spec_dir" ] || continue
    local capability
    capability=$(basename "$delta_spec_dir")
    local delta_spec="$delta_spec_dir/spec.md"

    if [ ! -f "$delta_spec" ]; then
      continue
    fi

    has_delta_specs=1
    yellow "  [DELTA] Found OpenSpec delta spec for capability: $capability"
  done

  if [ "$has_delta_specs" -eq 0 ]; then
    return 0
  fi

  if ! command -v openspec >/dev/null 2>&1; then
    red "FATAL: delta specs require OpenSpec archive/merge; openspec CLI was not found."
    red "This script will not copy delta specs over main specs because that can delete unchanged requirements."
    red "Next: install/run OpenSpec archive for '$CHANGE', or remove delta specs only if this change has no spec updates."
    exit 1
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    step_dry_run "Would merge delta specs with: openspec archive $CHANGE --yes"
    return 0
  fi

  openspec archive "$CHANGE" --yes
  OPENSPEC_ARCHIVE_RAN=1

  if [ -d "$ARCHIVE_DIR" ]; then
    CHANGE_DIR="$ARCHIVE_DIR"
    YAML="$CHANGE_DIR/.comet.yaml"
  elif [ -d "openspec/changes/archive/$CHANGE" ]; then
    ARCHIVE_NAME="$CHANGE"
    ARCHIVE_DIR="openspec/changes/archive/$CHANGE"
    CHANGE_DIR="$ARCHIVE_DIR"
    YAML="$CHANGE_DIR/.comet.yaml"
  else
    red "FATAL: OpenSpec archive completed but archive directory was not found"
    exit 1
  fi

  step_ok "Delta specs merged by OpenSpec archive"
}

sync_delta_specs

# --- Step 5: Annotate design doc frontmatter ---

annotate_frontmatter() {
  local file="$1"
  local extra_fields="$2"

  if [ ! -f "$file" ]; then
    return 0
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    step_dry_run "Would annotate: $file"
    return 0
  fi

  if head -1 "$file" | grep -q '^---'; then
    local tmp_file
    tmp_file=$(mktemp)
    awk -v archive="$ARCHIVE_NAME" -v extra="$extra_fields" '
      /^archived-with:/ { next }
      NR==1 && /^---/ { print; next }
      /^---/ && NR>1 {
        print "archived-with: " archive
        if (extra != "") print extra
        print; next
      }
      { print }
    ' "$file" > "$tmp_file"
    mv "$tmp_file" "$file"
  else
    local tmp_file
    tmp_file=$(mktemp)
    {
      echo "---"
      echo "archived-with: $ARCHIVE_NAME"
      if [ -n "$extra_fields" ]; then
        echo "$extra_fields"
      fi
      echo "status: final"
      echo "---"
      cat "$file"
    } > "$tmp_file"
    mv "$tmp_file" "$file"
  fi

  step_ok "Annotated: $file"
}

set_yaml_field_in_file() {
  local yaml_file="$1"
  local field="$2"
  local value="$3"

  if grep -q "^${field}:" "$yaml_file"; then
    local tmp_file
    tmp_file=$(mktemp)
    awk -v target="$field" -v replacement="${field}: ${value}" '
      BEGIN { done = 0 }
      $0 ~ "^" target ":" && done == 0 {
        print replacement
        done = 1
        next
      }
      { print }
    ' "$yaml_file" > "$tmp_file"
    mv "$tmp_file" "$yaml_file"
  else
    printf '%s: %s\n' "$field" "$value" >> "$yaml_file"
  fi
}

if [ -n "$DESIGN_DOC" ] && [ "$DESIGN_DOC" != "null" ]; then
  annotate_frontmatter "$DESIGN_DOC" "status: final"
fi

# --- Step 6: Annotate plan frontmatter ---

if [ -n "$PLAN_PATH" ] && [ "$PLAN_PATH" != "null" ]; then
  annotate_frontmatter "$PLAN_PATH" ""
fi

# --- Step 7: Move change to archive ---

if [ "$DRY_RUN" -eq 1 ]; then
  step_dry_run "Would move: $CHANGE_DIR → $ARCHIVE_DIR"
elif [ "$OPENSPEC_ARCHIVE_RAN" -eq 1 ]; then
  step_ok "OpenSpec moved change to: $ARCHIVE_DIR"
else
  mkdir -p "openspec/changes/archive"
  mv "$CHANGE_DIR" "$ARCHIVE_DIR"
  step_ok "Moved to: $ARCHIVE_DIR"
fi

# --- Step 8: Mark archived via comet-state transition ---

ARCHIVE_YAML="$ARCHIVE_DIR/.comet.yaml"

if [ "$DRY_RUN" -eq 1 ]; then
  step_dry_run "Would set archived: true in $ARCHIVE_YAML"
else
  if [ -f "$ARCHIVE_YAML" ]; then
    set_yaml_field_in_file "$ARCHIVE_YAML" "archived" "true"
    step_ok "archived: true"
  else
    step_fail "archived: true (.comet.yaml not found after move)"
  fi
fi

# --- Step 9: Print summary ---

echo "" >&2
if [ "$DRY_RUN" -eq 1 ]; then
  yellow "Dry run complete. $STEPS_OK/$STEPS_TOTAL steps would succeed."
else
  green "Archive complete. $STEPS_OK/$STEPS_TOTAL steps succeeded."
fi

if [ "$STEPS_OK" -lt "$STEPS_TOTAL" ]; then
  exit 1
fi

exit 0
