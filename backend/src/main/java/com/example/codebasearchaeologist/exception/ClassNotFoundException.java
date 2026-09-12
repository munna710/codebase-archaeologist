package com.example.codebasearchaeologist.exception;

public class ClassNotFoundException extends RuntimeException {
    public ClassNotFoundException(Long classId) {
        super("Class not found with id: " + classId);
    }
}