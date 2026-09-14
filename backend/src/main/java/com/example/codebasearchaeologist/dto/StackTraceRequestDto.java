package com.example.codebasearchaeologist.dto;

import jakarta.validation.constraints.NotBlank;

public class StackTraceRequestDto {

    @NotBlank(message = "Stack trace or error message cannot be empty")
    private String stackTrace;

    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
}