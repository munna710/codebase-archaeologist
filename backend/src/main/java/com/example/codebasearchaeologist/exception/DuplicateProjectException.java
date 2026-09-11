package com.example.codebasearchaeologist.exception;

public class DuplicateProjectException extends RuntimeException {
    public DuplicateProjectException(String repositoryUrl) {
        super("This repository has already been added: " + repositoryUrl);
    }
}