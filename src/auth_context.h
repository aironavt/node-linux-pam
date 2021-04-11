#ifndef SRC_AUTH_CONTEXT_H_
#define SRC_AUTH_CONTEXT_H_

#include <string>

struct auth_context {
    std::string username;
    std::string password;
    std::string serviceName{"login"};
    std::string remoteHost;
};

#endif  // SRC_AUTH_CONTEXT_H_
