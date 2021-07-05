const { execSync } = require('child_process');

module.exports = function(username, password) {
  execSync(`useradd ${username}`);
  execSync(`echo ${username}:${password} | chpasswd`);
};
