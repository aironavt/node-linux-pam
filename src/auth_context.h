#ifndef _SRV_NODEPAM_SRC_AUTH_CONTEXT_H_
#define _SRV_NODEPAM_SRC_AUTH_CONTEXT_H_

#include <string>

struct auth_context {
    std::string username;
    std::string password;
    std::string serviceName{"login"};
    std::string remoteHost;
};

#endif  // _SRV_NODEPAM_SRC_AUTH_CONTEXT_H_
