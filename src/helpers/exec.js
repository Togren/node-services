// ~~~~~~~~~~~~~~~~~~~~ IMPORTS ~~~~~~~~~~~~~~~~~~~~ //

// NodeJS native

// NPM packages
const shell = require('shelljs');

// Custom

// ~~~~~~~~~~~~~~~~~~~~ EXECUTION ~~~~~~~~~~~~~~~~~~~~ //

function exec(cmd, opts) {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, opts, (code, stdout, stderr) => {
      // Validate command execution
      if (code !== 0 || stderr) {
        reject(new Error(`Error executing command: ${cmd}. Exit code: ${code}, error: ${stderr}.`));
      }
      resolve(stdout);
    });
  });
}

function execSync(cmd, opts) {
  const { code, stdout, stderr } = shell.exec(cmd, opts);
  // Error check
  if (code !== 0 || stderr) {
    throw new Error(`Error executing command ${cmd}. Exit code: ${code}, error: ${stderr}.`);
  }
  // Return stdout
  return stdout;
}

module.exports = {
  exec,
  execSync,
};
