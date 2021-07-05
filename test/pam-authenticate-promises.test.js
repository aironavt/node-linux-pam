const { pamAuthenticatePromise, pamErrors, PamError } = require('../index');
const { userAdd, expiredUserAdd, userDel } = require('./helpers');

const USERNAME_OF_NON_EXISTENT_USER = 'promise-test-pam-non-existent-user';
const PASSWORD_OF_NON_EXISTENT_USER = 'promise-password';
const USERNAME_OF_AN_EXISTING_USER = 'promise-test-pam-user';
const PASSWORD_OF_AN_EXISTING_USER = 'promise-password';
const BAD_PASSWORD_OF_AN_EXISTING_USER = 'promise-bad-password';

describe('pamAuthenticatePromise', () => {
  describe('options', () => {
    test('password option is required', async () => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
      };

      const promise = pamAuthenticatePromise(options);

      await expect(promise).rejects.toThrow(TypeError('Password option is required'));
    });

    test('password option should ignore undefined', async () => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: undefined,
      };

      const promise = pamAuthenticatePromise(options);

      await expect(promise).rejects.toThrow(TypeError('Password option is required'));
    });

    test('username option is required', async () => {
      const options = {
        password: PASSWORD_OF_NON_EXISTENT_USER,
      };

      const promise = pamAuthenticatePromise(options);

      await expect(promise).rejects.toThrow(TypeError('Username option is required'));
    });

    test('username option should ignore undefined', async () => {
      const options = {
        username: undefined,
        password: PASSWORD_OF_NON_EXISTENT_USER,
      };

      const promise = pamAuthenticatePromise(options);

      await expect(promise).rejects.toThrow(TypeError('Username option is required'));
    });

    test('serviceName option should ignore undefined', async () => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: PASSWORD_OF_NON_EXISTENT_USER,
        serviceName: undefined,
      };

      const promise = pamAuthenticatePromise(options);

      await expect(promise).rejects.toThrow(PamError);
      await expect(promise).rejects.toThrow(expect.objectContaining({ code: pamErrors.PAM_AUTH_ERR }));
    });

    test('remoteHost option should ignore undefined', async () => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: PASSWORD_OF_NON_EXISTENT_USER,
        remoteHost: undefined,
      };

      const promise = pamAuthenticatePromise(options);

      await expect(promise).rejects.toThrow(PamError);
      await expect(promise).rejects.toThrow(expect.objectContaining({ code: pamErrors.PAM_AUTH_ERR }));
    });

    describe.each([
      ['username', 'Username should be a String'],
      ['password', 'Password should be a String'],
      ['serviceName', 'ServiceName should be a String'],
      ['remoteHost', 'RemoteHost should be a String'],
    ])('only string values can be passed to options', (option, expected) => {
      const notStrings = [5, true, null, new Function(), {}, [], Symbol('sym')];
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: PASSWORD_OF_NON_EXISTENT_USER,
        serviceName: '',
        remoteHost: '',
      };

      test.each(notStrings)(`should throw exceptions if ${option} is %p`, async (value) => {
        options[option] = value;

        const promise = pamAuthenticatePromise(options);

        await expect(promise).rejects.toThrow(TypeError(expected));
      });
    });
  });

  describe('when there is no user', () => {
    test(`should return an PamError with code ${pamErrors.PAM_AUTH_ERR}`, async () => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: PASSWORD_OF_NON_EXISTENT_USER,
      };

      const promise = pamAuthenticatePromise(options);

      await expect(promise).rejects.toThrow(PamError);
      await expect(promise).rejects.toThrow(expect.objectContaining({ code: pamErrors.PAM_AUTH_ERR }));
    });
  });

  describe('when there is a user', () => {
    beforeAll(() => {
      // Create user
      userAdd(USERNAME_OF_AN_EXISTING_USER, PASSWORD_OF_AN_EXISTING_USER);
    });

    afterAll(() => {
      // Delete user
      userDel(USERNAME_OF_AN_EXISTING_USER);
    });

    test(`should return code ${pamErrors.PAM_SUCCESS} with the correct password`, async () => {
      const options = {
        username: USERNAME_OF_AN_EXISTING_USER,
        password: PASSWORD_OF_AN_EXISTING_USER,
      };

      await expect(pamAuthenticatePromise(options)).resolves.toBe(pamErrors.PAM_SUCCESS);
    });

    test(`should return PamError with code ${pamErrors.PAM_AUTH_ERR} on wrong password`, async () => {
      const options = {
        username: USERNAME_OF_AN_EXISTING_USER,
        password: BAD_PASSWORD_OF_AN_EXISTING_USER,
      };

      const promise = pamAuthenticatePromise(options);

      await expect(promise).rejects.toThrow(PamError);
      await expect(promise).rejects.toThrow(expect.objectContaining({ code: pamErrors.PAM_AUTH_ERR }));
    });
  });

  describe('when there is a user with an expired password', () => {
    beforeAll(() => {
      // Create expired user
      expiredUserAdd(USERNAME_OF_AN_EXISTING_USER, PASSWORD_OF_AN_EXISTING_USER);
    });

    afterAll(() => {
      // Delete user
      userDel(USERNAME_OF_AN_EXISTING_USER);
    });

    test(`should return an PamError with code ${pamErrors.PAM_NEW_AUTHTOK_REQD}`, async () => {
      const options = {
        username: USERNAME_OF_AN_EXISTING_USER,
        password: PASSWORD_OF_AN_EXISTING_USER,
      };

      const promise = pamAuthenticatePromise(options);

      await expect(promise).rejects.toThrow(PamError);
      await expect(promise).rejects.toThrow(expect.objectContaining({ code: pamErrors.PAM_NEW_AUTHTOK_REQD }));
    });
  });
});
