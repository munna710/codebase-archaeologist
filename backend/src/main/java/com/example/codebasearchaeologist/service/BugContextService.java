package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.ai.OpenAiClient;
import com.example.codebasearchaeologist.analyzer.StackTraceParser;
import com.example.codebasearchaeologist.dto.BugContextDto;
import com.example.codebasearchaeologist.dto.RelevantClassDto;
import com.example.codebasearchaeologist.entity.JavaClass;
import com.example.codebasearchaeologist.repository.JavaClassRepository;
import com.example.codebasearchaeologist.security.ProjectAccessGuard;
import org.springframework.stereotype.Service;


import java.util.*;

@Service
public class BugContextService {

    private final StackTraceParser stackTraceParser;
    private final CodeSearchService codeSearchService;
    private final JavaClassRepository javaClassRepository;
    private final OpenAiClient openAiClient;
    private final ProjectAccessGuard projectAccessGuard;

    public BugContextService(StackTraceParser stackTraceParser,
                             CodeSearchService codeSearchService,
                             JavaClassRepository javaClassRepository,
                             OpenAiClient openAiClient, ProjectAccessGuard projectAccessGuard) {
        this.stackTraceParser = stackTraceParser;
        this.codeSearchService = codeSearchService;
        this.javaClassRepository = javaClassRepository;
        this.openAiClient = openAiClient;
        this.projectAccessGuard = projectAccessGuard;
    }

    public BugContextDto analyzeError(Long projectId, String rawStackTrace) {
        projectAccessGuard.requireOwnedProject(projectId);
        StackTraceParser.ParsedStackTrace parsed = stackTraceParser.parse(rawStackTrace);

        List<JavaClass> allProjectClasses = javaClassRepository.findByJavaFile_Project_ProjectId(projectId);
        Map<String, JavaClass> classesByName = new HashMap<>();
        for (JavaClass cls : allProjectClasses) {
            classesByName.put(cls.getClassName(), cls);
        }

        List<RelevantClassDto> results = new ArrayList<>();
        Set<Long> addedClassIds = new HashSet<>();

        // Tier 1: exact class name matches from the stack trace itself — highest
        // confidence, since these classes are literally on the call path.
        for (String mentionedName : parsed.getMentionedClassNames()) {
            JavaClass match = classesByName.get(mentionedName);
            if (match != null && addedClassIds.add(match.getClassId())) {
                results.add(new RelevantClassDto(
                        match.getClassId(), match.getClassName(), match.getPackageName(),
                        null, 100 // fixed high score — a direct stack frame match beats any search heuristic
                ));
            }
        }

        // Tier 2: if the exception message gives useful context, run it through
        // our existing hybrid (keyword + semantic) search too, to catch related
        // classes that didn't appear directly in the trace (e.g. the root cause
        // might be a validator or service the trace doesn't show frames for).
        if (parsed.getExceptionMessage() != null && !parsed.getExceptionMessage().isBlank()) {
            List<RelevantClassDto> searchResults =
                    codeSearchService.findRelevantClasses(projectId, parsed.getExceptionMessage());

            for (RelevantClassDto dto : searchResults) {
                if (addedClassIds.add(dto.getClassId())) {
                    results.add(dto);
                }
            }
        }

        String aiAnalysis = buildAiAnalysis(parsed, results, allProjectClasses.isEmpty());

        return new BugContextDto(parsed.getExceptionType(), parsed.getExceptionMessage(), results, aiAnalysis);
    }

    private String buildAiAnalysis(StackTraceParser.ParsedStackTrace parsed,
                                     List<RelevantClassDto> candidates, boolean noClassesInProject) {
        if (candidates.isEmpty()) {
            return "No classes in this codebase appear directly related to this error. "
                    + "The stack trace may reference external libraries, or the relevant class "
                    + "might not have been captured during analysis.";
        }

        StringBuilder context = new StringBuilder();
        context.append("Exception type: ").append(parsed.getExceptionType() != null ? parsed.getExceptionType() : "unknown").append("\n");
        context.append("Exception message: ").append(parsed.getExceptionMessage() != null ? parsed.getExceptionMessage() : "(none provided)").append("\n\n");
        context.append("Candidate classes (from stack trace and codebase search):\n");

        for (RelevantClassDto cls : candidates) {
            context.append("- ").append(cls.getClassName()).append(" (").append(cls.getPackageName()).append(")");
            if (cls.getDocumentationSnippet() != null) {
                context.append(": ").append(cls.getDocumentationSnippet());
            }
            context.append("\n");
        }

        String systemPrompt = "You are a senior software engineer helping a developer debug an error. "
                + "Given an exception type, message, and a list of candidate classes from the codebase "
                + "(some found directly in the stack trace, some found via search), explain the most "
                + "likely cause of this error and which class(es) to investigate first, in a few clear "
                + "sentences. Be specific and practical, not generic.";

        return openAiClient.generateExplanation(systemPrompt, context.toString());
    }
}