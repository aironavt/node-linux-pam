#include <napi.h>
#include <security/pam_appl.h>
#include "auth_context.h"
#include "pam_worker.h"

using namespace Napi;

void PamWorker::Execute() {
  pam_handle_t *pamh = nullptr;

  const char *username = authContext->username.c_str();
  const char *serviceName = authContext->serviceName.c_str();
  const char *remoteHost = authContext->remoteHost.c_str();
  const struct pam_conv local_conversation = {function_conversation, reinterpret_cast<void *>(authContext)};

  retval = pam_start(serviceName, username, &local_conversation, &pamh);
  HANDLE_PAM_ERROR;

  if (strlen(remoteHost)) {
    retval = pam_set_item(pamh, PAM_RHOST, remoteHost);
    HANDLE_PAM_ERROR;
  }

  // is user really user?
  retval = pam_authenticate(pamh, 0);
  HANDLE_PAM_ERROR;

  // permitted access?
  retval = pam_acct_mgmt(pamh, 0);
  HANDLE_PAM_ERROR;

  // close Linux-PAM
  retval = pam_end(pamh, retval);

  if (retval != PAM_SUCCESS) {
    SetError(pam_strerror(pamh, retval));
  }
}

void PamWorker::OnOK() {
  HandleScope scope(Env());
  Callback().Call({Env().Null(), Number::New(Env(), retval)});
}

void PamWorker::OnError(const Napi::Error &e) {
  HandleScope scope(Env());
  Callback().Call({e.Value(), Number::New(Env(), retval)});
}

int PamWorker::function_conversation(int num_msg,
                                     const struct pam_message **msg,
                                     struct pam_response **resp,
                                     void *appdata_ptr
                                    ) {
  auth_context *data = static_cast<auth_context *>(appdata_ptr);
  struct pam_response *reply = (struct pam_response *)malloc(sizeof(struct pam_response));

  reply->resp = strdup(data->password.c_str());
  reply->resp_retcode = 0;
  *resp = reply;

  return PAM_SUCCESS;
}
