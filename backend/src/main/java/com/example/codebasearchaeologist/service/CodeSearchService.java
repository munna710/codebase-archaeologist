package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.dto.RelevantClassDto;
import com.example.codebasearchaeologist.entity.Documentation;
import com.example.codebasearchaeologist.entity.JavaClass;
import com.example.codebasearchaeologist.entity.JavaMethod;
import com.example.codebasearchaeologist.repository.DocumentationRepository;
import com.example.codebasearchaeologist.repository.JavaClassRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CodeSearchService {

    private static final int MAX_RESULTS = 5;

    // Common English words that shouldn't count as meaningful search terms.
    private static final Set<String> STOP_WORDS = Set.of(
            "where", "is", "are", "the", "a", "an", "does", "do", "how", "what",
            "handled", "handle", "for", "in", "of", "to", "this", "that", "with"
    );

    private final JavaClassRepository javaClassRepository;
    private final DocumentationRepository documentationRepository;

    public CodeSearchService(JavaClassRepository javaClassRepository,
                              DocumentationRepository documentationRepository) {
        this.javaClassRepository = javaClassRepository;
        this.documentationRepository = documentationRepository;
    }

    public List<RelevantClassDto> findRelevantClasses(Long projectId, String question) {
        List<String> keywords = extractKeywords(question);

        List<JavaClass> allClasses = javaClassRepository.findByJavaFile_Project_ProjectId(projectId);

        // Build a lookup of classId -> its documentation content, if generated.
        Map<Long, String> docByClassId = documentationRepository.findByProject_ProjectId(projectId).stream()
                .filter(doc -> doc.getJavaClass() != null)
                .collect(Collectors.toMap(
                        doc -> doc.getJavaClass().getClassId(),
                        Documentation::getContent,
                        (a, b) -> a // in case of duplicates, keep the first
                ));

        List<RelevantClassDto> scored = new ArrayList<>();

        for (JavaClass javaClass : allClasses) {
            String docContent = docByClassId.get(javaClass.getClassId());
            int score = scoreClass(javaClass, docContent, keywords);

            if (score > 0) {
                String snippet = docContent != null
                        ? truncate(docContent, 300)
                        : null;

                scored.add(new RelevantClassDto(
                        javaClass.getClassId(),
                        javaClass.getClassName(),
                        javaClass.getPackageName(),
                        snippet,
                        score
                ));
            }
        }

        return scored.stream()
                .sorted((a, b) -> Integer.compare(b.getRelevanceScore(), a.getRelevanceScore()))
                .limit(MAX_RESULTS)
                .toList();
    }

    private int scoreClass(JavaClass javaClass, String docContent, List<String> keywords) {
        int score = 0;

        String classNameLower = javaClass.getClassName().toLowerCase();
        String docLower = docContent != null ? docContent.toLowerCase() : "";

        String methodNamesLower = javaClass.getMethods().stream()
                .map(JavaMethod::getMethodName)
                .collect(Collectors.joining(" "))
                .toLowerCase();

        for (String keyword : keywords) {
            // Class name match is the strongest signal — the user likely
            // knows roughly what the thing they're looking for is called.
            if (classNameLower.contains(keyword)) {
                score += 5;
            }
            // Method name match is a strong signal too.
            if (methodNamesLower.contains(keyword)) {
                score += 3;
            }
            // AI documentation match is a weaker, broader signal — the
            // keyword just needs to appear somewhere in the explanation.
            if (docLower.contains(keyword)) {
                score += 1;
            }
        }

        return score;
    }

    private List<String> extractKeywords(String question) {
        return Arrays.stream(question.toLowerCase().split("\\W+"))
                .filter(word -> word.length() > 2)
                .filter(word -> !STOP_WORDS.contains(word))
                .distinct()
                .toList();
    }

    private String truncate(String text, int maxLength) {
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }
}