package com.example.codebasearchaeologist.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class ChatQuestionDto {

    @NotBlank(message = "Question cannot be empty")
    private String question;

    private List<ChatMessageDto> history;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<ChatMessageDto> getHistory() { return history; }
    public void setHistory(List<ChatMessageDto> history) { this.history = history; }
}