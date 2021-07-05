![logo](images/node-linux-pam-logo.png)

[![Actions Status](https://github.com/aironavt/node-linux-pam/actions/workflows/build.yml/badge.svg)](https://github.com/aironavt/node-linux-pam/actions)
[![node-current](https://img.shields.io/node/v/node-linux-pam)](https://nodejs.org)

Asynchronous PAM authentication for NodeJS. Implements two PAM methods [pam_authenticate(3)](http://www.linux-pam.org/Linux-PAM-html/adg-interface-by-app-expected.html#adg-pam_authenticate) и [pam_acct_mgmt(3)](http://www.linux-pam.org/Linux-PAM-html/adg-interface-by-app-expected.html#adg-pam_acct_mgmt).

## Usage

### Callback example

```js
const { pamAuthenticate, pamErrors } = require('node-linux-pam');

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
```

### Promises example

```js
const { pamAuthenticatePromise, pamErrors, PamError } = require('node-linux-pam');

const options = {
  username: 'username',
  password: 'password',
};

pamAuthenticatePromise(options)
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
```

### CLI parameters

```shell
sudo nlp --username user --password pass --stderr-template "{ status: {name} }"
Error: Authentication failure
{ status: PAM_AUTH_ERR }
```

| Option name     | Description                                                                                                         | Default         | Required |
| --------------- | ------------------------------------------------------------------------------------------------------------------- | --------------- | -------- |
| username        | The name of the target user                                                                                         |                 | Yes      |
| password        | User password                                                                                                       |                 | Yes      |
| service-name    | The name of the service to apply                                                                                    | login           | No       |
| remote-host     | Sets the PAM_RHOST option via the pam_set_item(3) call                                                              |                 | No       |
| stdout-template | The template of the message that is printed to stdout on error. Available values to substitute: name, code, message | {message}       | No       |
| stderr-template | The template of the message that is printed to stderr on error. Available values to substitute: name, code, message | {name} [{code}] | No       |

## Requirements

This module require atleast `NodeJS 8`

Note that you will have a warning about N-API in version < 10, you can disable it by adding the `--no-warnings` flag to node

First you need to install the development version of PAM libraries for your distro.

- _Centos and RHEL:_ yum install pam-devel
- _Debian/Ubuntu:_ apt-get install libpam0g-dev

The user running the NodeJS process must have read permissions on the `/etc/shadow` file.

## Installation

```
npm install node-linux-pam -S
```

## Options

| Name        | Description                                                                                                                                           | Default | Required |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| username    | The name of the target user                                                                                                                           | ''      | Yes      |
| password    | User password                                                                                                                                         | ''      | Yes      |
| serviceName | The name of the service to apply                                                                                                                      | 'login' | No       |
| remoteHost  | Sets the PAM_RHOST option via the [pam_set_item(3)](http://www.linux-pam.org/Linux-PAM-html/adg-interface-by-app-expected.html#adg-pam_set_item) call | ''      | No       |

## Responce PAM code

| Code                      |     | Description                                                                                                                                                                            |
| ------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PAM_SUCCESS               | 0   | Successful function return                                                                                                                                                             |
| PAM_OPEN_ERR              | 1   | dlopen() failure when dynamically loading a service module                                                                                                                             |
| PAM_SYMBOL_ERR            | 2   | Symbol not found                                                                                                                                                                       |
| PAM_SERVICE_ERR           | 3   | Error in service module                                                                                                                                                                |
| PAM_SYSTEM_ERR            | 4   | System error                                                                                                                                                                           |
| PAM_BUF_ERR               | 5   | Memory buffer error                                                                                                                                                                    |
| PAM_PERM_DENIED           | 6   | Permission denied                                                                                                                                                                      |
| PAM_AUTH_ERR              | 7   | Authentication failure                                                                                                                                                                 |
| PAM_CRED_INSUFFICIENT     | 8   | Can not access authentication data due to insufficient credentials                                                                                                                     |
| PAM_AUTHINFO_UNAVAIL      | 9   | Underlying authentication service can not retrieve authentication information                                                                                                          |
| PAM_USER_UNKNOWN          | 10  | User not known to the underlying authenticaiton module                                                                                                                                 |
| PAM_MAXTRIES              | 11  | An authentication service has maintained a retry count which has been reached. No further retries should be attempted                                                                  |
| PAM_NEW_AUTHTOK_REQD      | 12  | New authentication token required. This is normally returned if the machine security policies require that the password should be changed beccause the password is NULL or it has aged |
| PAM_ACCT_EXPIRED          | 13  | User account has expired                                                                                                                                                               |
| PAM_SESSION_ERR           | 14  | Can not make/remove an entry for the specified session                                                                                                                                 |
| PAM_CRED_UNAVAIL          | 15  | Underlying authentication service can not retrieve user credentials unavailable                                                                                                        |
| PAM_CRED_EXPIRED          | 16  | User credentials expired                                                                                                                                                               |
| PAM_CRED_ERR              | 17  | Failure setting user credentials                                                                                                                                                       |
| PAM_NO_MODULE_DATA        | 18  | No module specific data is present                                                                                                                                                     |
| PAM_CONV_ERR              | 19  | Conversation error                                                                                                                                                                     |
| PAM_AUTHTOK_ERR           | 20  | Authentication token manipulation error                                                                                                                                                |
| PAM_AUTHTOK_RECOVERY_ERR  | 21  | Authentication information cannot be recovered                                                                                                                                         |
| PAM_AUTHTOK_LOCK_BUSY     | 22  | Authentication token lock busy                                                                                                                                                         |
| PAM_AUTHTOK_DISABLE_AGING | 23  | Authentication token aging disabled                                                                                                                                                    |
| PAM_TRY_AGAIN             | 24  | Preliminary check by password service                                                                                                                                                  |
| PAM_IGNORE                | 25  | Ignore underlying account module regardless of whether the control flag is required, optional, or sufficient                                                                           |
| PAM_ABORT                 | 26  | Critical error (?module fail now request)                                                                                                                                              |
| PAM_AUTHTOK_EXPIRED       | 27  | user's authentication token has expired                                                                                                                                                |
| PAM_MODULE_UNKNOWN        | 28  | module is not known                                                                                                                                                                    |
| PAM_BAD_ITEM              | 29  | Bad item passed to pam\_\*\_item()                                                                                                                                                     |
| PAM_CONV_AGAIN            | 30  | conversation function is event driven and data is not available yet                                                                                                                    |
| PAM_INCOMPLETE            | 31  | please call this function again to complete authentication stack. Before calling again, verify that conversation is completed                                                          |

## License

[MIT](LICENSE)
