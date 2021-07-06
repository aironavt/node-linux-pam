const { execSync } = require('child_process');

module.exports = function(username) {
  execSync(`userdel --force ${username}`);
};
