package com.example.codebasearchaeologist.dto;

public class ChatMessageDto {

    private String role; // "user" or "assistant"
    private String content;

    public ChatMessageDto() {
    }

    public ChatMessageDto(String role, String content) {
        this.role = role;
        this.content = content;
    }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}