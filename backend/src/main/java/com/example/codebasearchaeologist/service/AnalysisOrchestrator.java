package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.analyzer.*;
import com.example.codebasearchaeologist.entity.*;
import com.example.codebasearchaeologist.exception.RepositoryDownloadException;
import com.example.codebasearchaeologist.repository.DependencyRepository;
import com.example.codebasearchaeologist.repository.JavaFileRepository;
import com.example.codebasearchaeologist.repository.ProjectRepository;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.*;

@Service
public class AnalysisOrchestrator {

    private final ProjectRepository projectRepository;
    private final JavaFileRepository javaFileRepository;
    private final DependencyRepository dependencyRepository;
    private final RepositoryDownloader repositoryDownloader;
    private final JavaFileScanner javaFileScanner;
    private final JavaCodeParser javaCodeParser;
    private final CodeExtractor codeExtractor;
    private final DependencyAnalyzer dependencyAnalyzer;

    public AnalysisOrchestrator(ProjectRepository projectRepository,
                                 JavaFileRepository javaFileRepository,
                                 DependencyRepository dependencyRepository,
                                 RepositoryDownloader repositoryDownloader,
                                 JavaFileScanner javaFileScanner,
                                 JavaCodeParser javaCodeParser,
                                 CodeExtractor codeExtractor,
                                 DependencyAnalyzer dependencyAnalyzer) {
        this.projectRepository = projectRepository;
        this.javaFileRepository = javaFileRepository;
        this.dependencyRepository = dependencyRepository;
        this.repositoryDownloader = repositoryDownloader;
        this.javaFileScanner = javaFileScanner;
        this.javaCodeParser = javaCodeParser;
        this.codeExtractor = codeExtractor;
        this.dependencyAnalyzer = dependencyAnalyzer;
    }

    /**
     * Runs the full analysis pipeline in the background, updating the
     * project's status at each stage so the frontend can poll for progress.
     *
     * IMPORTANT: since this runs on a background thread with no caller
     * waiting for it, any exception thrown here would otherwise be silently
     * swallowed by Spring's async machinery (just logged, never surfaced).
     * So we must catch everything ourselves and record failure via the
     * project's status field — that's the only channel back to the frontend.
     */
    @Async("analysisExecutor")
    public void runAnalysis(Long projectId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return; // project was deleted before analysis started; nothing to do
        }

        try {
            project.setStatus(ProjectStatus.CLONING);
            projectRepository.save(project);

            File clonedDir = repositoryDownloader.cloneRepository(project.getRepositoryUrl(), project.getProjectId());

            project.setStatus(ProjectStatus.PARSING);
            projectRepository.save(project);

            List<File> javaFiles = javaFileScanner.findJavaFiles(clonedDir);
            if (javaFiles.isEmpty()) {
                throw new RuntimeException("No Java files found in this repository.");
            }

            JavaParser parser = javaCodeParser.buildParser(clonedDir);

            Map<String, JavaClass> classesByName = new HashMap<>();
            Map<JavaClass, ClassOrInterfaceDeclaration> declarationsByClass = new HashMap<>();

            for (File javaFile : javaFiles) {
                Optional<CompilationUnit> cuOpt = javaCodeParser.parseFile(parser, javaFile);
                if (cuOpt.isEmpty()) continue;

                CompilationUnit cu = cuOpt.get();
                JavaFile extractedFile = codeExtractor.extractFile(cu, javaFile, project);
                javaFileRepository.save(extractedFile);

                List<ClassOrInterfaceDeclaration> declarations = cu.findAll(ClassOrInterfaceDeclaration.class);
                for (JavaClass savedClass : extractedFile.getClasses()) {
                    declarations.stream()
                            .filter(d -> d.getNameAsString().equals(savedClass.getClassName()))
                            .findFirst()
                            .ifPresent(decl -> declarationsByClass.put(savedClass, decl));
                    classesByName.put(savedClass.getClassName(), savedClass);
                }
            }

            project.setStatus(ProjectStatus.ANALYZING_DEPENDENCIES);
            projectRepository.save(project);

            List<Dependency> dependencies = dependencyAnalyzer.analyzeDependencies(classesByName, declarationsByClass);
            dependencyRepository.saveAll(dependencies);

            project.setStatus(ProjectStatus.COMPLETED);
            projectRepository.save(project);

        } catch (Exception e) {
            System.err.println("Analysis failed for project " + projectId + ": " + e.getMessage());
            project.setStatus(ProjectStatus.FAILED);
            projectRepository.save(project);
        }
    }
}