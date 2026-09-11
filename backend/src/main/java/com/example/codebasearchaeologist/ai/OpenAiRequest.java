package com.example.codebasearchaeologist.ai;

import java.util.List;

public class OpenAiRequest {

    private String model;
    private List<Message> messages;
    private double temperature = 0.3;

    public OpenAiRequest(String model, List<Message> messages) {
        this.model = model;
        this.messages = messages;
    }

    public String getModel() { return model; }
    public List<Message> getMessages() { return messages; }
    public double getTemperature() { return temperature; }

    public static class Message {
        private String role;
        private String content;

        public Message() {
        }

        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }


        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}