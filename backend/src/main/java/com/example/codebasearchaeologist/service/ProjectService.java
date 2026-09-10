package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.analyzer.CodeExtractor;
import com.example.codebasearchaeologist.analyzer.JavaCodeParser;
import com.example.codebasearchaeologist.analyzer.JavaFileScanner;
import com.example.codebasearchaeologist.analyzer.RepositoryDownloader;
import com.example.codebasearchaeologist.dto.ProjectRequestDto;
import com.example.codebasearchaeologist.dto.ProjectResponseDto;
import com.example.codebasearchaeologist.entity.Dependency;
import com.example.codebasearchaeologist.entity.JavaFile;
import com.example.codebasearchaeologist.entity.Project;
import com.example.codebasearchaeologist.entity.ProjectStatus;
import com.example.codebasearchaeologist.exception.RepositoryDownloadException;
import com.example.codebasearchaeologist.repository.JavaFileRepository;
import com.example.codebasearchaeologist.repository.ProjectRepository;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ast.CompilationUnit;
import org.springframework.stereotype.Service;
import com.example.codebasearchaeologist.analyzer.DependencyAnalyzer;
import com.example.codebasearchaeologist.entity.Dependency;
import com.example.codebasearchaeologist.entity.JavaClass;
import com.example.codebasearchaeologist.repository.DependencyRepository;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import java.util.HashMap;
import java.util.Map;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final JavaFileRepository javaFileRepository;
    private final RepositoryDownloader repositoryDownloader;
    private final JavaFileScanner javaFileScanner;
    private final JavaCodeParser javaCodeParser;
    private final CodeExtractor codeExtractor;
    private final DependencyAnalyzer dependencyAnalyzer;
    private final DependencyRepository dependencyRepository;

    public ProjectService(ProjectRepository projectRepository,
                          JavaFileRepository javaFileRepository,
                          RepositoryDownloader repositoryDownloader,
                          JavaFileScanner javaFileScanner,
                          JavaCodeParser javaCodeParser,
                          CodeExtractor codeExtractor,
                          DependencyAnalyzer dependencyAnalyzer,
                          DependencyRepository dependencyRepository) {
        this.projectRepository = projectRepository;
        this.javaFileRepository = javaFileRepository;
        this.repositoryDownloader = repositoryDownloader;
        this.javaFileScanner = javaFileScanner;
        this.javaCodeParser = javaCodeParser;
        this.codeExtractor = codeExtractor;
        this.dependencyAnalyzer = dependencyAnalyzer;
        this.dependencyRepository = dependencyRepository;
    }


    public ProjectResponseDto createProject(ProjectRequestDto requestDto) {
        Project project = new Project();

        String[] parts = requestDto.getRepositoryUrl().split("/");
        String derivedName = parts[parts.length - 1].replace(".git", "");

        project.setProjectName(derivedName);
        project.setDescription(requestDto.getDescription());
        project.setRepositoryUrl(requestDto.getRepositoryUrl());
        project.setUploadedAt(LocalDateTime.now());
        project.setStatus(ProjectStatus.PENDING);

        Project saved = projectRepository.save(project);
        return toResponseDto(saved);
    }

    public ProjectResponseDto analyzeProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        project.setStatus(ProjectStatus.ANALYZING);
        projectRepository.save(project);

        try {
            File clonedDir = repositoryDownloader.cloneRepository(project.getRepositoryUrl(), project.getProjectId());
            List<File> javaFiles = javaFileScanner.findJavaFiles(clonedDir);

            if (javaFiles.isEmpty()) {
                project.setStatus(ProjectStatus.FAILED);
                projectRepository.save(project);
                throw new RuntimeException("No Java files found in this repository.");
            }

            JavaParser parser = javaCodeParser.buildParser(clonedDir);

            // Track saved JavaClass entities by simple name, and their original AST
            // declarations, so we can run dependency analysis across all files afterward.
            Map<String, JavaClass> classesByName = new HashMap<>();
            Map<JavaClass, ClassOrInterfaceDeclaration> declarationsByClass = new HashMap<>();

            int parsedCount = 0;
            for (File javaFile : javaFiles) {
                Optional<CompilationUnit> cuOpt = javaCodeParser.parseFile(parser, javaFile);
                if (cuOpt.isEmpty()) {
                    continue;
                }

                CompilationUnit cu = cuOpt.get();
                JavaFile extractedFile = codeExtractor.extractFile(cu, javaFile, project);
                javaFileRepository.save(extractedFile); // cascades: saves classes + methods, assigns IDs
                parsedCount++;

                // Pair each saved JavaClass with its original AST declaration for dependency analysis.
                List<ClassOrInterfaceDeclaration> declarations = cu.findAll(ClassOrInterfaceDeclaration.class);
                for (JavaClass savedClass : extractedFile.getClasses()) {
                    declarations.stream()
                            .filter(d -> d.getNameAsString().equals(savedClass.getClassName()))
                            .findFirst()
                            .ifPresent(decl -> declarationsByClass.put(savedClass, decl));

                    classesByName.put(savedClass.getClassName(), savedClass);
                }
            }

            System.out.println("Saved " + parsedCount + " / " + javaFiles.size() + " files to database");

            // Now that all classes across all files are known, analyze dependencies between them.
            List<Dependency> dependencies = dependencyAnalyzer.analyzeDependencies(classesByName, declarationsByClass);
            dependencyRepository.saveAll(dependencies);
            System.out.println("Found and saved " + dependencies.size() + " dependencies");

            project.setStatus(ProjectStatus.COMPLETED);
            projectRepository.save(project);

        } catch (RepositoryDownloadException e) {
            project.setStatus(ProjectStatus.FAILED);
            projectRepository.save(project);
            throw e;
        }

        return toResponseDto(project);
    }

    public List<ProjectResponseDto> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    public ProjectResponseDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return toResponseDto(project);
    }

    private ProjectResponseDto toResponseDto(Project project) {
        return new ProjectResponseDto(
                project.getProjectId(),
                project.getProjectName(),
                project.getDescription(),
                project.getRepositoryUrl(),
                project.getUploadedAt(),
                project.getStatus()
        );
    }
}