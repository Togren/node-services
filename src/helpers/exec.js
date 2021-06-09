// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native

// NPM packages
const shell = require('shelljs');

// Custom
const ExecutionError = require('../errors/ExecutionError');

// ~~~~~~~~~~~~~~~~~~~~ EXECUTION ~~~~~~~~~~~~~~~~~~~~ //

function exec(cmd, opts) {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, opts, (code, stdout, stderr) => {
      // Validate command execution
      if (code !== 0 || stderr) {
        reject(new ExecutionError(cmd, code, stderr));
      }
      resolve(stdout);
    });
  });
}

function execSync(cmd, opts) {
  const { code, stdout, stderr } = shell.exec(cmd, opts);
  // Error check
  if (code !== 0 || stderr) {
    throw new ExecutionError(cmd, code, stderr);
  }
  // Return stdout
  return stdout;
}

module.exports = {
  exec,
  execSync,
};
