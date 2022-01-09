1. 术语

1.1. `promise` 是一个对象或函数，这个对象或函数有 `then` 方法，`then` 方法的行为符合本规范。

1.2. `thenable` 是一个对象或函数，这个对象或函数定义一个 `then` 方法。

1.3. `value` 是任意合法的 Javascript 值（包括 undefined, thenable, 或 promise）。

1.4. `exception` 是一个值，这个值是 `throw` 声明抛出的。

1.5. `reason` 是一个值，这个值表示一个 promise 为什么被拒绝。

2. 要求

2.1. Promise 状态

一个 promise 必须是以下三种状态的一种： pending, fulfilled, rejected。

2.1.1. 当 promise 的状态是 pending:

2.1.1.1. 可能转换成 fulfilled 或 rejected 状态。

2.1.2. 当 promise 的状态是 fulfilled:

2.1.2.1. 不能转换成其他状态。

2.1.2.2. 必须有一个值，这个值不能改变。

2.1.3. 当 promise 的状态是 rejected:

2.1.3.1. 不能转换成其他状态。

2.1.3.2. 必须有一个 reason， 这个 reason 不能改变。

这里， `不能改变` 意味着不变的特征，比如（i.e. `===`），但不意味着深度特征。

2.2. `then` 方法

promise 必须提供一个 `then` 方法，这个方法接收当前的或最终的 value 或者 reason。

promise 的 then 方法接收两个参数：

```
promise.then(onFulfilled, onRejected)
```

2.2.1. `onFulfilled` 和 `onRejected` 都是可选参数：

2.2.1.1. 如果 onFulfilled 不是函数，它必须被忽略。

2.2.1.2. 如果 onRejected 不是函数，它必须被忽略。

2.2.2. 如果 onFulfilled 是函数：

2.2.2.1. 这个函数必须在 promise 的状态转换到 fulfilled 后执行，promise 的 value 作为它的第一个参数。

2.2.2.2. 这个函数必须不能在 promise 的状态转换到 fulfilled 之前执行。

2.2.2.3. 这个函数最多只能执行一次。

2.2.3. 如果 onRejected 是函数：

2.2.3.1. 这个函数必须在 promise 的状态转换到 rejected 后执行，promise 的 reason 作为它的第一个参数。

2.2.3.2. 这个函数必须不能在 promise 的状态转换到 rejected 之前执行。

2.2.3.3. 这个函数最多只能执行一次。

2.2.4. onFulfilled 或 onRejected 必须不能执行，直到运行上下文堆栈只包含平台代码。

2.2.5. onFulfilled 和 onRejected 必须只能作为一个函数执行，（i.e. 没有 this 值）。

2.2.6. then 可能在相同的 promise 执行多次。

2.2.6.1. 一旦 promise 的状态转换成 fulfilled ，所有各自的 onFulfilled 回调函数必须按照他们执行 then 函数的原始顺序执行。

2.2.6.2. 一旦 promise 的状态转换成 rejected， 所有各自的 onRejected 回调函数必须按照他们执行 then 函数的原始顺序执行。

2.2.7. then 必须返回一个 promise。

```
promise2 = promise1.then(onFulfilled, onRejected);
```

2.2.7.1. 如果 onFulfilled 或 onRejected 返回一个值 x，运行 promise 决议流程 `[[Resolve]](promise2, x)`。

2.2.7.2. 如果 onFiulfilled 或 onRejected 抛出异常 `e`，promise2 必须使用 e 作为 reason 拒绝。

2.2.7.3. 如果 onFulfilled 不是函数，promise1 是 fulfilled 状态，promise2 必须转换成 fulfilled 状态，且 value 是 promise1.

2.2.7.4. 如果 onRejected 不是函数， promise1 是 rejected 状态，promise2 必须转换成 rejected 状态，切 reason 是 promise1.

2.3. Promise 解决过程

Promise 解决过程是一个抽象操作，输入一个 promise 和一个 value，我们表示为 `[[Resolve]](promise, x)`。
如果 x 是一个 thenable， 它企图创造一个 promise 接收 x 的状态，之后假定 x 的行为至少看起来像个 promise。
否则它将 promise 的状态转换到 fulfilled， 值是 x。

这个 thenable 的处理方式允许 promise 实现交互操作，只要他们暴露一个规范的 then 方法。
它也允许规范实现相似的不同实现，只要实现 then 方法。

运行 `[[Resolve]](promise, x)`，执行以下步骤：

2.3.1. 如果 promise 和 x 指的是相同的对象，拒绝 promise，原因是 `TypeError`。

2.3.2. 如果 x 是一个 promise， 转换状态：

2.3.2.1. 如果 x 是 pending 状态，promise 必须保留 pending 状态，直到 x 状态转换为 fulfilled 或 rejected。

2.3.2.2. 如果 x 是 fulfilled 状态， fulfilled 状态的 promise 使用相同的值。

2.3.2.3. 如果 x 是 rejected 状态，以相同的 reason 拒绝 promise。

2.3.3. 否则，如果 x 是一个对象或函数，

2.3.3.1. 定义 then 是 x.then

2.3.3.2. 如果检索属性 x.then 抛出异常 e， 以 e 作为 reason 拒绝 promise。

2.3.3.3. 如果 then 是一个函数，以 x 作为 this 执行，第一个参数 resolvePromise， 和第二个参数 rejectPromise，

2.3.3.3.1. 如果 resolvePromise 使用 y 作为 value 执行， 运行 `[[Resolve]](promise, y)`

2.3.3.3.2. 如果 rejectPromise 以 r 作为 reason 执行，以 r 作为 reason 拒绝 promise。

2.3.3.3.3. 如果 resolvePromise 和 rejectPromise 被执行，或多次使用相同的参数执行，优先执行第一次，其他忽略。

2.3.3.3.4. 如果执行 then 抛出异常 e，

2.3.3.3.4.1. 如果 resolvePromise 或 rejectPromise 已经执行，忽略。

2.3.3.3.4.2. 否则，以 e 作为 reason 拒绝 promise。

2.3.3.4 如果 then 不是函数， 将 promise 的状态转换到 fulfilled， value 是 x。

2.3.4. 如果 x 不是对象或函数，将 promise 到状态切换到 fulfilled， value 是 x。

如果 promise 通过一个参与到循环 thenable 链的 thenable 来 resolved， 就想递归 `[[Resolve]](promise, thenable)`，
最终引发 `[[Resolve]](promise, thenable)` 再次执行，遵循上述算法，将导致无限循环。
实现是受到鼓励的，但不是必须的，删除类似的递归，拒绝 promise，以一个 TypeError 作为 reason。