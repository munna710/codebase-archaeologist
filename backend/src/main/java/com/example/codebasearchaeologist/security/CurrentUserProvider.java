package com.example.codebasearchaeologist.security;

import com.example.codebasearchaeologist.exception.InvalidCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (!(principal instanceof AuthenticatedUser user)) {
            throw new InvalidCredentialsException();
        }

        return user.getUserId();
    }
}