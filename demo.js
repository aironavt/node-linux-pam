const {
  pamAuthenticate,
  pamErrors,
} = require('./index');

const options = {
  username: 'username',
  password: 'password',
};

pamAuthenticate(options, function (err, code) {
  if (!err) {
    console.log("Authenticated!");
    return;
  }

  if (err && code === pamErrors.PAM_NEW_AUTHTOK_REQD) {
    console.log('Authentication token is expired');
    return;
  }

  console.log(err, code);
});
