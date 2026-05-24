# 为 OpenCode 安装源生 Claw Agent4

在全局或项目级 `opencode.json` 的 `plugin` 数组中加入本包。

本地检出示例：

```json
{
  "plugin": ["/Users/zq/Desktop/ai-projs/posp/yuan-sheng/opencode-agent4"]
}
```

如果使用基于 Git 的安装，将路径替换为仓库 URL：

```json
{
  "plugin": ["ysclaw-agent4@git+https://example.com/ysclaw-agent4.git"]
}
```

更新配置后重启 OpenCode。

## 验证

让 OpenCode 列出技能，并确认以下名称存在：

- `using-ysclaw-agent4`
- `ysclaw-root-cause-blueprint-reader`
- `ysclaw-patch-plan-writer`
- `ysclaw-regression-verifier`
- `ysclaw-verified-patch-package-writer`

运行本地检查：

```bash
npm test
```
