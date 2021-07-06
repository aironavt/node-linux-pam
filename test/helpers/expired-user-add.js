const { execSync } = require('child_process');
const userAdd = require('./user-add');

module.exports = function(username, password) {
  userAdd(username, password);
  execSync(`passwd --expire ${username}`);
};
