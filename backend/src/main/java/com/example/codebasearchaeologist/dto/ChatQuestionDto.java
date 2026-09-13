package com.example.codebasearchaeologist.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatQuestionDto {

    @NotBlank(message = "Question cannot be empty")
    private String question;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
}