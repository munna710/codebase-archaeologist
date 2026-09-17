package com.example.codebasearchaeologist.security;

public class AuthenticatedUser {
    private final Long userId;
    private final String email;

    public AuthenticatedUser(Long userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
}