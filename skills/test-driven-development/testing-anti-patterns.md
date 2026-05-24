# 测试反模式

**何时加载:** 编写或修改测试、添加 mock、或想在生产代码中加入 test-only 方法时。

## 概览

测试必须验证真实行为，不是验证 mock 行为。mock 是隔离手段，不是被测对象。

**核心原则:** 测代码做了什么，不测 mock 做了什么。

严格 TDD 能防止多数反模式。

## 铁律

```text
1. 永远不要测试 mock 行为。
2. 永远不要为了测试给生产类添加 test-only 方法。
3. 不理解依赖前不要 mock。
```

## 反模式 1：测试 Mock 行为

违规：

```typescript
// 错误：只是在测试 mock 存在
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});
```

为什么错：

- 你验证的是 mock，不是组件。
- mock 存在就通过，不存在就失败。
- 对真实行为没有任何证明。

修复：

```typescript
// 正确：测试真实组件，或不要 mock 它
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

Gate：

```text
断言任何 mock 元素前，先问：
“我是在测试真实组件行为，还是只是在测试 mock 存在？”

如果只是测试 mock 存在：
  停止，删除断言或取消 mock。
```

## 反模式 2：生产代码中的 Test-Only 方法

违规：

```typescript
class Session {
  async destroy() {  // 只被测试使用，却像生产 API
    await this._workspaceManager?.destroyWorkspace(this.id);
  }
}
```

为什么错：

- 生产类被测试清理逻辑污染。
- 误在生产调用可能危险。
- 违反 YAGNI 和关注点分离。

修复：

```typescript
// test-utils/
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}
```

Gate：

```text
给生产类添加方法前问：
“这是否只被测试使用？”

如果是：
  停止。放到 test utilities。
```

## 反模式 3：不理解依赖就 Mock

违规：

```typescript
test('detects duplicate server', () => {
  vi.mock('ToolCatalog', () => ({
    discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
  }));

  await addServer(config);
  await addServer(config);  // 应该 throw，但不会
});
```

问题：被 mock 的方法有测试依赖的副作用，例如写配置。过度 mock 破坏真实行为。

修复：在更低层 mock 慢或外部操作，保留测试需要的行为。

Gate：

```text
mock 任何方法前：
1. 它有什么副作用？
2. 当前测试是否依赖这些副作用？
3. 我是否理解依赖链？

如果依赖副作用：
  在更低层 mock，或使用保留必要行为的 test double。
```

## 反模式 4：不完整 Mock

违规：

```typescript
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' }
  // 缺少 downstream 使用的 metadata
};
```

为什么错：

- 部分 mock 隐藏结构假设。
- 下游代码可能依赖遗漏字段。
- 测试通过但集成失败。

铁律：mock 完整真实结构，而不是只 mock 眼前测试用到的字段。

修复：

```typescript
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
};
```

## 反模式 5：把集成测试当事后补充

违规：

```text
实现完成
没有测试
“可以测试了”
```

测试是实现的一部分，不是可选后续。没有测试就不能声称完成。

修复：按 TDD 先写测试，至少覆盖核心行为和风险边界。

## 反模式 6：放宽断言来让测试通过

违规：

```typescript
expect(result.length).toBeGreaterThan(0); // 原本应该等于 3
```

问题：你让测试失去证明力。

修复：弄清为什么预期不满足。只有需求确实改变时，才更新断言，并说明原因。

## 反模式 7：任意 Sleep

违规：

```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
```

问题：慢、flaky，且没有表达等待条件。

修复：

```typescript
await waitFor(() => expect(store.status).toBe('ready'));
```

## 反模式 8：只测快乐路径

只覆盖成功输入会漏掉真实风险。至少考虑：

- 空输入。
- 无效输入。
- 权限不足。
- 网络或 I/O 失败。
- 边界大小。
- 并发或重复调用。

## 反模式 9：测试内部实现

如果测试直接依赖私有方法、内部状态或临时结构，重构会无谓破坏测试。

优先测试公共行为。如果必须检查内部不变量，说明原因，并让断言尽量稳定。

## 完成前 Checklist

- [ ] 新测试在实现前失败过。
- [ ] 测试失败原因是预期原因。
- [ ] 实现后测试通过。
- [ ] 测试验证真实行为。
- [ ] mock 保留必要副作用和完整结构。
- [ ] 没有 test-only 生产 API。
- [ ] 没有任意 sleep。
- [ ] 相关套件通过。
