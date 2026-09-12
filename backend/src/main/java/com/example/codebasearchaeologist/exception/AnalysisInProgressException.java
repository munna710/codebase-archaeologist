package com.example.codebasearchaeologist.exception;

public class AnalysisInProgressException extends RuntimeException {
    public AnalysisInProgressException(Long projectId) {
        super("Project " + projectId + " is already being analyzed.");
    }
}