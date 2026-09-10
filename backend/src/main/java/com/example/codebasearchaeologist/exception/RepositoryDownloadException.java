package com.example.codebasearchaeologist.exception;

public class RepositoryDownloadException extends RuntimeException {

    public RepositoryDownloadException(String message) {
        super(message);
    }

    public RepositoryDownloadException(String message, Throwable cause) {
        super(message, cause);
    }
}