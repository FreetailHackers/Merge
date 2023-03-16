// Run build.sh from command line
const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function build() {
  const { stdout, stderr } = await exec("./scripts/build.sh");
  console.log("stdout:", stdout);
  console.log("stderr:", stderr);
}
build();
