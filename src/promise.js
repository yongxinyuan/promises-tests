const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class Promise {
  constructor() {
    this.state = PENDING;
    this.result = null;
  }
}

module.exports = {
  resolved: function (value) {
    return value;
  },
  rejected: function (reason) {
    return reason;
  },
  deferred: function () {
    return {
      promise: function () {},
      resolve: function (value) {
        return value;
      },
      reject: function (reason) {
        return reason;
      },
    };
  },
};
