const { pamAuthenticate, pamErrors } = require('../index');

const options = {
  username: 'username',
  password: 'password',
};

pamAuthenticate(options, (err, code) => {
  if (!err) {
    console.log('Authenticated!');
    return;
  }

  if (code === pamErrors.PAM_NEW_AUTHTOK_REQD) {
    console.log('Authentication token is expired');
    return;
  }

  console.log(err, code);
});
