const { pamAuthenticatePromises, pamErrors, PamError } = require('../index');

const options = {
  username: 'username',
  password: 'password',
};

pamAuthenticatePromises(options)
  .then(() => {
    console.log('Authenticated!');
  })
  .catch((err) => {
    if (err instanceof PamError) {
      const { message, code } = err;

      if (code === pamErrors.PAM_NEW_AUTHTOK_REQD) {
        console.log('Authentication token is expired');
        return;
      }

      console.log(message, code);
    }
  });
