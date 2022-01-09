const States = {
  Pending: "pending",
  Fulfilled: "fulfilled",
  Rejected: "rejected"
}

const resolvePromise = (promise, x, resolve, reject) => {
  if (promise === x) {
    return reject(new TypeError('circyle reference.'));
  }

  var called = false;

  // 值是 promise
  if (x instanceof Promise) {
    if (x.state === States.Pending) {
      x.then(
        (value) => {
          resolvePromise(promise, value, resolve, reject);
        },
        (reason) => {
          reject(reason);
        }
      );
    }
    else {
      x.then(resolve, reject);
    };
  }
  // 值是对象或函数
  else if (x !== null && ((typeof x === 'object') || (typeof x === 'function'))) {
    try {
      const then = x.then;

      if (typeof then === 'function') {
        then.call(
          x,
          (value) => {
            if (called) return;
            called = true;
            resolvePromise(promise, value, resolve, reject);
          },
          (reason) => {
            if (called) return;

            called = true;

            reject(reason);
          }
        );
      }
      else {
        resolve(x);
      }
    }
    catch (e) {
      if (called) return;

      called = true;

      reject(e);
    }
  }
  else {
    resolve(x);
  }
}

const gen = (length, resolve) => {
  let count = 0;
  let values = [];

  return (index, value) => {
    values[index] = value;
    if (++count === length) {
      resolve(values);
    }
  }
}

class Promise {
  /**
   * 构造函数
   */
  constructor(executor) {
    this.state = States.Pending;
    this.value = undefined;
    this.reason = undefined;

    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const reject = (reason) => {
      setTimeout(() => {
        if (this.state === States.Pending) {
          this.state = States.Rejected;
          this.reason = reason;
          this.onRejectedCallbacks.forEach(cb => cb(this.reason));
        }
      });
    }

    const resolve = (value) => {
      if (value instanceof Promise) {
        return value.then(resolve, reject);
      }

      setTimeout(() => {
        if (this.state === States.Pending) {
          this.state = States.Fulfilled;
          this.value = value;
          this.onFulfilledCallbacks.forEach(cb => {
            cb(this.value);
          });
        }
      });
    }

    try {
      // 构造函数同步执行
      executor(resolve, reject);
    }
    catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function'
      ? onFulfilled
      : value => value;
    onRejected = typeof onRejected === 'function'
      ? onRejected
      : reason => {
        throw reason;
      }

    const res = {};

    if (this.state === States.Fulfilled) {
      return res.promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(res.promise, x, resolve, reject);
          }
          catch (e) {
            reject(e);
          }
        });
      });
    }

    if (this.state === States.Rejected) {
      return res.promise = new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(res.promise, x, resolve, reject);
          }
          catch (e) {
            reject(e);
          }
        });
      });
    }

    if (this.state === States.Pending) {
      return res.promise = new Promise((resolve, reject) => {
        this.onFulfilledCallbacks.push((value) => {
          try {
            const x = onFulfilled(value);
            resolvePromise(res.promise, x, resolve, reject);
          }
          catch (e) {
            reject(e);
          }
        });
        this.onRejectedCallbacks.push((reason) => {
          try {
            const x = onRejected(reason);
            resolvePromise(res.promise, x, resolve, reject);
          }
          catch (e) {
            reject(e);
          }
        });
      });
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      const done = gen(promises.length, resolve);
      promises.forEach((promise, index) => {
        promise.then(value => {
          done(index, value);
        });
      });
    });
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach((promise, index) => {
        promise.then(resolve, reject);
      });
    });
  }

  static resolve(value) {
    return new Promise((resolve) => {
      resolve(value);
    });
  }

  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }
}

module.exports = {
  deferred: () => {
    const defer = {};

    defer.promise = new Promise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
    })

    return defer;
  }
}