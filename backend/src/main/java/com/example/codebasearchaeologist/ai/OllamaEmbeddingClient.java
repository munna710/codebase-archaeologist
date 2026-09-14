package com.example.codebasearchaeologist.ai;

import com.example.codebasearchaeologist.exception.AiServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class OllamaEmbeddingClient {

    private final RestClient restClient;
    private final String model;

    public OllamaEmbeddingClient(
            @Value("${ollama.api.url}") String apiUrl,
            @Value("${ollama.embedding.model}") String model) {

        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl(apiUrl)
                .build();
    }

    public float[] embed(String text) {
        OllamaEmbeddingRequest request = new OllamaEmbeddingRequest(model, text);

        try {
            OllamaEmbeddingResponse response = restClient.post()
                    .header("Content-Type", "application/json")
                    .body(request)
                    .retrieve()
                    .body(OllamaEmbeddingResponse.class);

            if (response == null || response.getEmbedding() == null || response.getEmbedding().isEmpty()) {
                throw new AiServiceException("Ollama returned an empty embedding.");
            }

            List<Double> embedding = response.getEmbedding();
            float[] result = new float[embedding.size()];
            for (int i = 0; i < embedding.size(); i++) {
                result[i] = embedding.get(i).floatValue();
            }
            return result;

        } catch (Exception e) {
            throw new AiServiceException(
                    "Failed to generate embedding via Ollama. Is Ollama running locally? " + e.getMessage(), e);
        }
    }

    public String toVectorLiteral(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(embedding[i]);
        }
        sb.append("]");
        return sb.toString();
    }
}