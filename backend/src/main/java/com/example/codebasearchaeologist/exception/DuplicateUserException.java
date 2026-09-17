package com.example.codebasearchaeologist.exception;

public class DuplicateUserException extends RuntimeException {
    public DuplicateUserException(String email) {
        super("An account with email " + email + " already exists.");
    }
}