const promisesAplusTests = require("../lib/programmaticRunner");
const adapter = require("./promise");

promisesAplusTests(adapter, { reporter: "dot" }, function (err) {
  // As before.
});
