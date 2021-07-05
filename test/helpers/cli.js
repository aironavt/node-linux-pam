const path = require('path');
const { exec } = require('child_process');

module.exports = function(params, cwd) {
  const defaultParams = {
    // Simplifying error analysis
    'stderr-template': '"{code}"',
  };

  const objectParams = {
    ...defaultParams,
    ...params,
  };

  let args = [];

  for (const [paramName, paramValue] of Object.entries(objectParams)) {
    args.push(`--${paramName} ${paramValue}`);
  }

  return new Promise((resolve) => {
    exec(`node ${path.resolve('./cli.js')} ${args.join(' ')}`, { cwd }, (error, stdout, stderr) => {
      resolve({
        error,
        code: error && error.code ? error.code : 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
};
