package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.ai.OpenAiClient;
import com.example.codebasearchaeologist.ai.PromptBuilder;
import com.example.codebasearchaeologist.dto.ChatAnswerDto;
import com.example.codebasearchaeologist.dto.RelevantClassDto;
import com.example.codebasearchaeologist.security.ProjectAccessGuard;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final CodeSearchService codeSearchService;
    private final OpenAiClient openAiClient;
    private final PromptBuilder promptBuilder;
    private final ProjectAccessGuard projectAccessGuard;

    public ChatService(CodeSearchService codeSearchService,
                       OpenAiClient openAiClient,
                       PromptBuilder promptBuilder, ProjectAccessGuard projectAccessGuard) {
        this.codeSearchService = codeSearchService;
        this.openAiClient = openAiClient;
        this.promptBuilder = promptBuilder;
        this.projectAccessGuard = projectAccessGuard;
    }

    public ChatAnswerDto answerQuestion(Long projectId, String question) {
        projectAccessGuard.requireOwnedProject(projectId);
        List<RelevantClassDto> relevantClasses = codeSearchService.findRelevantClasses(projectId, question);

        if (relevantClasses.isEmpty()) {
            return new ChatAnswerDto(
                    "I couldn't find any classes in this codebase related to your question. " +
                    "Try rephrasing it, or check the Code Explorer to browse the codebase directly.",
                    relevantClasses
            );
        }

        String systemPrompt = promptBuilder.buildChatSystemPrompt();
        String userPrompt = promptBuilder.buildChatUserPrompt(question, relevantClasses);

        String answer = openAiClient.generateExplanation(systemPrompt, userPrompt);

        return new ChatAnswerDto(answer, relevantClasses);
    }
}