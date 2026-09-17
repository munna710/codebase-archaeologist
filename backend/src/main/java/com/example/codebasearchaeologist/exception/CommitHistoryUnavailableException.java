package com.example.codebasearchaeologist.exception;

public class CommitHistoryUnavailableException extends RuntimeException {
    public CommitHistoryUnavailableException(String message) {
        super(message);
    }
}