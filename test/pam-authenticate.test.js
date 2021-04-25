const { execSync } = require('child_process');
const { pamAuthenticate, pamErrors } = require('../index');

const USERNAME_OF_NON_EXISTENT_USER = 'callback-test-pam-non-existent-user';
const PASSWORD_OF_NON_EXISTENT_USER = 'callback-password';
const USERNAME_OF_AN_EXISTING_USER = 'callback-test-pam-user';
const PASSWORD_OF_AN_EXISTING_USER = 'callback-password';
const BAD_PASSWORD_OF_AN_EXISTING_USER = 'callback-bad-password';

describe('pamAuthenticate', () => {
  describe('when there is no user', () => {
    test(`should return an error with code ${pamErrors.PAM_AUTH_ERR}`, (done) => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: PASSWORD_OF_NON_EXISTENT_USER,
      };

      pamAuthenticate(options, (err, code) => {
        expect(code).toBe(pamErrors.PAM_AUTH_ERR);
        done();
      });
    });
  });

  describe('when there is a user', () => {
    beforeAll(() => {
      // Create user
      execSync(`useradd ${USERNAME_OF_AN_EXISTING_USER}`);
      execSync(`echo ${USERNAME_OF_AN_EXISTING_USER}:${PASSWORD_OF_AN_EXISTING_USER} | chpasswd`);
    });

    afterAll(() => {
      // Delete user
      execSync(`userdel --force ${USERNAME_OF_AN_EXISTING_USER}`);
    });

    test(`should return code ${pamErrors.PAM_SUCCESS} with the correct password`, (done) => {
      const options = {
        username: USERNAME_OF_AN_EXISTING_USER,
        password: PASSWORD_OF_AN_EXISTING_USER,
      };

      pamAuthenticate(options, (err, code) => {
        expect(code).toBe(pamErrors.PAM_SUCCESS);
        done();
      });
    });

    test(`should return error with code ${pamErrors.PAM_AUTH_ERR} on wrong password`, (done) => {
      const options = {
        username: USERNAME_OF_AN_EXISTING_USER,
        password: BAD_PASSWORD_OF_AN_EXISTING_USER,
      };

      pamAuthenticate(options, (err, code) => {
        expect(code).toBe(pamErrors.PAM_AUTH_ERR);
        done();
      });
    });
  });

  describe('when there is a user with an expired password', () => {
    beforeAll(() => {
      // Create user
      execSync(`useradd ${USERNAME_OF_AN_EXISTING_USER}`);
      execSync(`echo ${USERNAME_OF_AN_EXISTING_USER}:${PASSWORD_OF_AN_EXISTING_USER} | chpasswd`);
      execSync(`passwd --expire ${USERNAME_OF_AN_EXISTING_USER}`);
    });

    afterAll(() => {
      // Delete user
      execSync(`userdel --force ${USERNAME_OF_AN_EXISTING_USER}`);
    });

    test(`should return an error with code ${pamErrors.PAM_NEW_AUTHTOK_REQD}`, (done) => {
      const options = {
        username: USERNAME_OF_AN_EXISTING_USER,
        password: PASSWORD_OF_AN_EXISTING_USER,
      };

      pamAuthenticate(options, (err, code) => {
        expect(code).toBe(pamErrors.PAM_NEW_AUTHTOK_REQD);
        done();
      });
    });
  });
});
