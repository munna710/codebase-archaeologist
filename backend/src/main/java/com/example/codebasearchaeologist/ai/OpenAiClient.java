package com.example.codebasearchaeologist.ai;

import com.example.codebasearchaeologist.exception.AiServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class OpenAiClient {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public OpenAiClient(
            @Value("${openai.api.url}") String apiUrl,
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.model}") String model) {

        this.apiKey = apiKey;
        this.model = model;

        if (apiKey == null || apiKey.isBlank() || !apiKey.startsWith("sk-or-v1-")) {
            throw new IllegalArgumentException(
                    "Invalid OpenRouter API key. It must start with 'sk-or-v1-'."
            );
        }
        System.out.println("API key loaded: " + (apiKey != null && !apiKey.isBlank()));
        System.out.println("API URL: " + apiUrl);
        System.out.println("Model: " + model);
        this.restClient = RestClient.builder()
                .baseUrl(apiUrl)
                .build();
    }

    public String generateExplanation(String systemPrompt, String userPrompt) {
        OpenAiRequest request = new OpenAiRequest(
                model,
                List.of(
                        new OpenAiRequest.Message("system", systemPrompt),
                        new OpenAiRequest.Message("user", userPrompt)
                )
        );

        try {
            OpenAiResponse response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(request)
                    .retrieve()
                    .body(OpenAiResponse.class);

            if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
                throw new AiServiceException("OpenAI returned an empty response.");
            }

            return response.getChoices().get(0).getMessage().getContent();

        } catch (Exception e) {
            throw new AiServiceException("Failed to generate AI explanation: " + e.getMessage(), e);
        }
    }
}