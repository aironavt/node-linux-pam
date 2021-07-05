#!/usr/bin/env node

const yargs = require('yargs');
const format = require('string-template');
const { pamAuthenticatePromise, pamErrors } = require('./index');

const argv = yargs.usage('Usage: $0 [options]').options({
  username: {
    alias: 'u',
    demandOption: true,
    describe: 'The name of the target user',
    type: 'string',
  },
  password: {
    alias: 'p',
    demandOption: true,
    describe: 'User password',
    type: 'string',
  },
  'service-name': {
    alias: 's',
    default: 'login',
    describe: 'The name of the service to apply',
    type: 'string',
  },
  'remote-host': {
    alias: 'r',
    describe: 'Sets the PAM_RHOST option via the pam_set_item(3) call',
    type: 'string',
  },
  'stdout-template': {
    alias: 'ot',
    default: '{message}',
    describe: `The template of the message that is printed to stdout on error.
               Available values to substitute: name, code, message`,
    type: 'string',
  },
  'stderr-template': {
    alias: 'et',
    default: '{name} [{code}]',
    describe: `The template of the message that is printed to stderr on error.
               Available values to substitute: name, code, message`,
    type: 'string',
  },
  help: {
    alias: 'h',
    description: 'Show help',
  },
  version: {
    alias: 'v',
    description: 'Show version number',
  },
}).argv;

const { username, password, serviceName, remoteHost, stdoutTemplate, stderrTemplate } = argv;

pamAuthenticatePromise({ username, password, serviceName, remoteHost })
  .then(() => {
    console.log('success');
  })
  .catch((err) => {
    const { message, code } = err;
    const [name] = Object.entries(pamErrors).find(([, id]) => id === code);
    const value = {
      name, // PAM_AUTH_ERR
      code, // 7
      message, // Error: Authentication failure
    };

    const stdOut = format(stdoutTemplate, value);
    const stdErr = format(stderrTemplate, value);

    console.log(stdOut);
    console.error(stdErr);
    process.exit(1);
  });
