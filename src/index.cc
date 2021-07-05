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

  bool hasUsername = options.Has("username");
  bool hasPassword = options.Has("password");

  if (!hasUsername || options.Get("username").IsUndefined()) {
    throw TypeError::New(env, "Username option is required");
  }

  if (hasUsername && !options.Get("username").IsString()) {
    throw TypeError::New(env, "Username should be a String");
  }

  if (!hasPassword || options.Get("password").IsUndefined()) {
    throw TypeError::New(env, "Password option is required");
  }

  if (hasPassword && !options.Get("password").IsString()) {
    throw TypeError::New(env, "Password should be a String");
  }

  if (options.Has("serviceName")
    && !options.Get("serviceName").IsUndefined()
    && !options.Get("serviceName").IsString()
  ) {
    throw TypeError::New(env, "ServiceName should be a String");
  }

  if (options.Has("remoteHost")
    && !options.Get("remoteHost").IsUndefined()
    && !options.Get("remoteHost").IsString()
  ) {
    throw TypeError::New(env, "RemoteHost should be a String");
  }
}

void initAuthContext(const CallbackInfo &info, auth_context *authContext) {
  Object options = info[0].As<Object>();

  if (options.Has("serviceName") && !options.Get("serviceName").IsUndefined()) {
    authContext->serviceName = options.Get("serviceName").As<String>().Utf8Value();
  }

  if (options.Has("remoteHost") && !options.Get("remoteHost").IsUndefined()) {
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
