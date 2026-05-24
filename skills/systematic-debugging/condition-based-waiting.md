# 基于条件的等待

## 概览

异步测试失败时，固定 sleep 通常只是掩盖问题。正确做法是等待真实条件成立。

**核心原则:** 等待状态、事件或输出，而不是等待时间。

## 不要这样做

```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
expect(result).toBeDefined();
```

问题：

- 机器慢时仍然 flaky。
- 机器快时浪费时间。
- 没表达真正等待什么。

## 应该这样做

```typescript
await waitFor(() => {
  expect(store.status).toBe('ready');
});
```

或等待具体事件：

```typescript
await once(emitter, 'ready');
```

或等待输出：

```typescript
await waitUntil(() => logs.some(line => line.includes('server started')));
```

## 通用 waitUntil

```typescript
export async function waitUntil(
  condition: () => boolean | Promise<boolean>,
  { timeoutMs = 5000, intervalMs = 25 } = {}
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  throw new Error('Timed out waiting for condition');
}
```

## 选择等待条件

好条件：

- 某个状态字段变成目标值。
- 某个事件被发出。
- 某个 promise resolve。
- 文件存在且内容匹配。
- 队列为空。
- 网络端口开始接受连接。

坏条件：

- “等 1 秒应该够了”。
- “CI 比本地慢，所以等 5 秒”。
- “循环 20 次看看”但没有诊断信息。

## 失败时提供诊断

timeout 错误应说明正在等什么，并附带当前状态：

```typescript
throw new Error(`Timed out waiting for ready; current status=${store.status}`);
```

这样失败时能直接继续调查。

## 何时使用 fake timers

如果代码本身基于时间，例如 debounce、retry backoff、cache TTL，使用 fake timers 控制时间。

如果代码基于事件或 I/O，不要用 fake timers 模拟真实异步，应等待事件或状态。

## Checklist

- [ ] 没有任意 sleep。
- [ ] 等待条件对应真实业务状态。
- [ ] timeout 报错包含当前状态。
- [ ] 条件失败能帮助定位问题。
- [ ] 测试在本地和 CI 都稳定。
