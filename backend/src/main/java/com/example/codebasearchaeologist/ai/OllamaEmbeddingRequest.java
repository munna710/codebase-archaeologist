package com.example.codebasearchaeologist.ai;

public class OllamaEmbeddingRequest {

    private String model;
    private String prompt;

    public OllamaEmbeddingRequest(String model, String prompt) {
        this.model = model;
        this.prompt = prompt;
    }

    public String getModel() { return model; }
    public String getPrompt() { return prompt; }
}