package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.ai.OpenAiClient;
import com.example.codebasearchaeologist.ai.PromptBuilder;
import com.example.codebasearchaeologist.analyzer.SourceCodeReader;
import com.example.codebasearchaeologist.entity.*;
import com.example.codebasearchaeologist.repository.DependencyRepository;
import com.example.codebasearchaeologist.repository.DocumentationRepository;
import com.example.codebasearchaeologist.repository.JavaClassRepository;
import com.example.codebasearchaeologist.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DocumentationService {

    private final ProjectRepository projectRepository;
    private final JavaClassRepository javaClassRepository;
    private final DependencyRepository dependencyRepository;
    private final DocumentationRepository documentationRepository;
    private final OpenAiClient openAiClient;
    private final PromptBuilder promptBuilder;
    private final SourceCodeReader sourceCodeReader;

    public DocumentationService(ProjectRepository projectRepository,
                                 JavaClassRepository javaClassRepository,
                                 DependencyRepository dependencyRepository,
                                 DocumentationRepository documentationRepository,
                                 OpenAiClient openAiClient,
                                 PromptBuilder promptBuilder,
                                 SourceCodeReader sourceCodeReader) {
        this.projectRepository = projectRepository;
        this.javaClassRepository = javaClassRepository;
        this.dependencyRepository = dependencyRepository;
        this.documentationRepository = documentationRepository;
        this.openAiClient = openAiClient;
        this.promptBuilder = promptBuilder;
        this.sourceCodeReader = sourceCodeReader;
    }

    /**
     * Generates AI documentation for every class in a project that doesn't
     * already have documentation, and saves the results.
     */
    public List<Documentation> generateDocumentationForProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        List<JavaClass> allClasses = javaClassRepository.findByJavaFile_Project_ProjectId(projectId).stream().limit(3).toList();
        List<Dependency> allDependencies = dependencyRepository.findBySourceClass_JavaFile_Project_ProjectId(projectId);

        String systemPrompt = promptBuilder.buildSystemPrompt();

        for (JavaClass javaClass : allClasses) {
            // Skip classes that already have documentation, so re-running this
            // endpoint doesn't waste API calls / money on unchanged classes.
            if (documentationRepository.findByJavaClass_ClassId(javaClass.getClassId()).isPresent()) {
                continue;
            }

            List<Dependency> outgoing = allDependencies.stream()
                    .filter(d -> d.getSourceClass().getClassId().equals(javaClass.getClassId()))
                    .toList();

            String sourceCode = sourceCodeReader.readSource(javaClass.getJavaFile().getFilePath());
            String userPrompt = promptBuilder.buildClassExplanationPrompt(javaClass, outgoing, sourceCode);

            String explanation = openAiClient.generateExplanation(systemPrompt, userPrompt);

            Documentation doc = new Documentation();
            doc.setProject(project);
            doc.setJavaClass(javaClass);
            doc.setContent(explanation);
            doc.setCreatedAt(LocalDateTime.now());

            documentationRepository.save(doc);

            System.out.println("Generated documentation for class: " + javaClass.getClassName());
        }

        return documentationRepository.findByProject_ProjectId(projectId);
    }

    public List<Documentation> getDocumentationForProject(Long projectId) {
        return documentationRepository.findByProject_ProjectId(projectId);
    }
}