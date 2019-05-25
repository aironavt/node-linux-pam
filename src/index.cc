#include <napi.h>
#include <security/pam_appl.h>
#include "auth_context.h"
#include "pam_worker.h"

using namespace Napi;

void validate(const CallbackInfo &info) {
  Env env = info.Env();
  Object options = info[0].As<Object>();

  if (info.Length() < 2) {
    throw TypeError::New(env, "Wrong number of arguments");
  }

  if (!info[0].IsObject()) {
    throw TypeError::New(env, "Argument 1 should be a Object");
  }

  if (!info[1].IsFunction()) {
    throw TypeError::New(env, "Argument 2 should be a Function");
  }

  if (!options.Has("username")) {
    throw TypeError::New(env, "Username option is requered");
  }

  if (!options.Has("password")) {
    throw TypeError::New(env, "Password option is requered");
  }
}

void initAuthContext(const CallbackInfo &info, auth_context *authContext) {
  Object options = info[0].As<Object>();

  if (options.Has("serviceName")) {
    authContext->serviceName = options.Get("serviceName").As<String>().Utf8Value();
  }

  if (options.Has("remoteHost")) {
    authContext->remoteHost = options.Get("remoteHost").As<String>().Utf8Value();
  }

  authContext->username = options.Get("username").As<String>().Utf8Value();
  authContext->password = options.Get("password").As<String>().Utf8Value();
}

void RunCallback(const CallbackInfo &info) {
  struct auth_context *authContext = new auth_context;

  try {
    validate(info);
    initAuthContext(info, authContext);
  }
  catch (const Napi::Error &error) {
    error.ThrowAsJavaScriptException();
    return;
  }

  Function callback = info[1].As<Function>();

  PamWorker *pamWorker = new PamWorker(callback, authContext);
  pamWorker->Queue();
}

Object Init(Env env, Object exports) {
  return Function::New(env, RunCallback);
}

NODE_API_MODULE(addon, Init)
