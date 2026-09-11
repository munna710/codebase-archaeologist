package com.example.codebasearchaeologist.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    private final com.example.codebasearchaeologist.ai.OpenAiClient openAiClient;

    public TestController(com.example.codebasearchaeologist.ai.OpenAiClient openAiClient) {
        this.openAiClient = openAiClient;
    }

    @GetMapping("/api/hello")
    public String sayHello() {
        return "Codebase Archaeologist backend is running!";
    }

    @GetMapping("/api/test-ai")
    public String testAi() {
        return openAiClient.generateExplanation(
                "You are a helpful assistant.",
                "Say hello and confirm you are working, in one sentence."
        );
    }

}