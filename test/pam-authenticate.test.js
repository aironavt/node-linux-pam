const { execSync } = require('child_process');
const { pamAuthenticate, pamErrors } = require('../index');

const USERNAME_OF_NON_EXISTENT_USER = 'callback-test-pam-non-existent-user';
const PASSWORD_OF_NON_EXISTENT_USER = 'callback-password';
const USERNAME_OF_AN_EXISTING_USER = 'callback-test-pam-user';
const PASSWORD_OF_AN_EXISTING_USER = 'callback-password';
const BAD_PASSWORD_OF_AN_EXISTING_USER = 'callback-bad-password';

describe('pamAuthenticate', () => {
  describe('options', () => {
    test('password option is required', () => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
      };

      expect(() => {
        pamAuthenticate(options, () => {});
      }).toThrow(TypeError('Password option is required'));
    });

    test('password option should ignore undefined', () => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: undefined,
      };

      expect(() => {
        pamAuthenticate(options, () => {});
      }).toThrow(TypeError('Password option is required'));
    });

    test('username option is required', () => {
      const options = {
        password: PASSWORD_OF_NON_EXISTENT_USER,
      };

      expect(() => {
        pamAuthenticate(options, () => {});
      }).toThrow(TypeError('Username option is required'));
    });

    test('username option should ignore undefined', () => {
      const options = {
        username: undefined,
        password: PASSWORD_OF_NON_EXISTENT_USER,
      };

      expect(() => {
        pamAuthenticate(options, () => {});
      }).toThrow(TypeError('Username option is required'));
    });

    test('serviceName option should ignore undefined', (done) => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: PASSWORD_OF_NON_EXISTENT_USER,
        serviceName: undefined,
      };

      pamAuthenticate(options, (err, code) => {
        expect(code).toBe(pamErrors.PAM_AUTH_ERR);
        done();
      });
    });

    test('remoteHost option should ignore undefined', (done) => {
      const options = {
        username: USERNAME_OF_NON_EXISTENT_USER,
        password: PASSWORD_OF_NON_EXISTENT_USER,
        remoteHost: undefined,
      };

      pamAuthenticate(options, (err, code) => {
        expect(code).toBe(pamErrors.PAM_AUTH_ERR);
        done();
      });
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

      test.each(notStrings)(`should throw exceptions if ${option} is %p`, (value) => {
        options[option] = value;

        expect(() => {
          pamAuthenticate(options, () => {});
        }).toThrow(TypeError(expected));
      });
    });
  });

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
