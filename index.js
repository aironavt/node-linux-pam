const pam = require('bindings')('node-linux-pam');

/**
 * Enum for The Linux - PAM return values
 * @readonly
 * @enum {number}
 */
const pamErrors = Object.freeze({
  /** Successful function return */
  PAM_SUCCESS: 0,
  /** dlopen() failure when dynamically loading a service module */
  PAM_OPEN_ERR: 1,
  /** Symbol not found */
  PAM_SYMBOL_ERR: 2,
  /** Error in service module */
  PAM_SERVICE_ERR: 3,
  /** System error */
  PAM_SYSTEM_ERR: 4,
  /** Memory buffer error */
  PAM_BUF_ERR: 5,
  /** Permission denied */
  PAM_PERM_DENIED: 6,
  /** Authentication failure */
  PAM_AUTH_ERR: 7,
  /** Can not access authentication data due to insufficient credentials */
  PAM_CRED_INSUFFICIENT: 8,
  /** Underlying authentication service can not retrieve authentication information  */
  PAM_AUTHINFO_UNAVAIL: 9,
  /** User not known to the underlying authenticaiton module */
  PAM_USER_UNKNOWN: 10,
  /** 
   * An authentication service has maintained a retry count which has been reached.
   * No further retries should be attempted
   */
  PAM_MAXTRIES: 11,
  /** 
   * New authentication token required. This is normally returned if the machine security policies require that
   * the password should be changed beccause the password is NULL or it has aged
   */
  PAM_NEW_AUTHTOK_REQD: 12,
  /** User account has expired */
  PAM_ACCT_EXPIRED: 13,
  /** Can not make/remove an entry for the specified session */
  PAM_SESSION_ERR: 14,
  /** Underlying authentication service can not retrieve user credentials unavailable */
  PAM_CRED_UNAVAIL: 15,
  /** User credentials expired */
  PAM_CRED_EXPIRED: 16,
  /** Failure setting user credentials */
  PAM_CRED_ERR: 17,
  /** No module specific data is present */
  PAM_NO_MODULE_DATA: 18,
  /** Conversation error */
  PAM_CONV_ERR: 19,
  /** Authentication token manipulation error */
  PAM_AUTHTOK_ERR: 20,
  /** Authentication information cannot be recovered */
  PAM_AUTHTOK_RECOVERY_ERR: 21,
  /** Authentication token lock busy */
  PAM_AUTHTOK_LOCK_BUSY: 22,
  /** Authentication token aging disabled */
  PAM_AUTHTOK_DISABLE_AGING: 23,
  /** Preliminary check by password service */
  PAM_TRY_AGAIN: 24,
  /** Ignore underlying account module regardless of whether the control flag is required, optional, or sufficient */
  PAM_IGNORE: 25,
  /** Critical error (?module fail now request) */
  PAM_ABORT: 26,
  /** user's authentication token has expired */
  PAM_AUTHTOK_EXPIRED: 27,
  /** module is not known */
  PAM_MODULE_UNKNOWN: 28,
  /** Bad item passed to pam_*_item() */
  PAM_BAD_ITEM: 29,
  /** conversation function is event driven and data is not available yet */
  PAM_CONV_AGAIN: 30,
  /**
   * please call this function again to complete authentication stack. Before calling again, verify that 
   * conversation is completed
   */
  PAM_INCOMPLETE: 31,
});

module.exports = {
  default: pam,
  pamAuthenticate: pam,
  pamErrors,
};
