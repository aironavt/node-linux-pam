const { execSync } = require('child_process');
const { pamAuthenticatePromises, pamErrors, PamError } = require('../index');

const USERNAME_OF_NON_EXISTENT_USER = 'promise-test-pam-non-existent-user';
const PASSWORD_OF_NON_EXISTENT_USER = 'promise-password';
const USERNAME_OF_AN_EXISTING_USER = 'promise-test-pam-user';
const PASSWORD_OF_AN_EXISTING_USER = 'promise-password';
const BAD_PASSWORD_OF_AN_EXISTING_USER = 'promise-bad-password';

describe('pamAuthenticatePromises', () => {
  describe('when there is no user', () => {
    test(`should return an PamError with code ${pamErrors.PAM_AUTH_ERR}`, async () => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: PASSWORD_OF_NON_EXISTENT_USER,
      };

      const promise = pamAuthenticatePromises(options);

      await expect(promise).rejects.toThrow(PamError);
      await expect(promise).rejects.toThrow(expect.objectContaining({ code: pamErrors.PAM_AUTH_ERR }));
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

    test(`should return code ${pamErrors.PAM_SUCCESS} with the correct password`, async () => {
      const options = {
        username: USERNAME_OF_AN_EXISTING_USER,
        password: PASSWORD_OF_AN_EXISTING_USER,
      };

      await expect(pamAuthenticatePromises(options)).resolves.toBe(pamErrors.PAM_SUCCESS);
    });

    test(`should return PamError with code ${pamErrors.PAM_AUTH_ERR} on wrong password`, async () => {
      const options = {
        username: USERNAME_OF_AN_EXISTING_USER,
        password: BAD_PASSWORD_OF_AN_EXISTING_USER,
      };

      const promise = pamAuthenticatePromises(options);

      await expect(promise).rejects.toThrow(PamError);
      await expect(promise).rejects.toThrow(expect.objectContaining({ code: pamErrors.PAM_AUTH_ERR }));
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

    test(`should return an PamError with code ${pamErrors.PAM_NEW_AUTHTOK_REQD}`, async () => {
      const options = {
        username: USERNAME_OF_AN_EXISTING_USER,
        password: PASSWORD_OF_AN_EXISTING_USER,
      };

      const promise = pamAuthenticatePromises(options);

      await expect(promise).rejects.toThrow(PamError);
      await expect(promise).rejects.toThrow(expect.objectContaining({ code: pamErrors.PAM_NEW_AUTHTOK_REQD }));
    });
  });
});
