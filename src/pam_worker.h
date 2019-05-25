#ifndef _SRV_NODEPAM_SRC_PAM_WORKER_H_
#define _SRV_NODEPAM_SRC_PAM_WORKER_H_

using namespace Napi;

#define HANDLE_PAM_ERROR                         \
  if (retval != PAM_SUCCESS) {                   \
    /* close Linux-PAM */                        \
    pam_end(pamh, retval);                       \
    return SetError(pam_strerror(pamh, retval)); \
  }

class PamWorker : public AsyncWorker {
 public:
  PamWorker(const Function &callback, auth_context *authContext)
    : AsyncWorker(callback), authContext(authContext) {}

  ~PamWorker() {
    delete authContext;
  }

  void Execute();
  void OnOK();
  void OnError(const Error &e);

 private:
  auth_context *authContext;
  int retval;

  static int function_conversation(int num_msg,
                                   const struct pam_message **msg,
                                   struct pam_response **resp,
                                   void *appdata_ptr);
};

#endif  // _SRV_NODEPAM_SRC_PAM_WORKER_H_
