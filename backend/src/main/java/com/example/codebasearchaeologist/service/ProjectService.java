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
import com.example.codebasearchaeologist.exception.AnalysisInProgressException;
import com.example.codebasearchaeologist.exception.DuplicateProjectException;
import com.example.codebasearchaeologist.exception.ProjectNotFoundException;
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
    private final AnalysisOrchestrator analysisOrchestrator;



    public ProjectService(ProjectRepository projectRepository,
                          JavaFileRepository javaFileRepository,
                          RepositoryDownloader repositoryDownloader,
                          JavaFileScanner javaFileScanner,
                          JavaCodeParser javaCodeParser,
                          CodeExtractor codeExtractor,
                          DependencyAnalyzer dependencyAnalyzer,
                          DependencyRepository dependencyRepository, AnalysisOrchestrator analysisOrchestrator) {
        this.projectRepository = projectRepository;
        this.javaFileRepository = javaFileRepository;
        this.repositoryDownloader = repositoryDownloader;
        this.javaFileScanner = javaFileScanner;
        this.javaCodeParser = javaCodeParser;
        this.codeExtractor = codeExtractor;
        this.dependencyAnalyzer = dependencyAnalyzer;
        this.dependencyRepository = dependencyRepository;
        this.analysisOrchestrator = analysisOrchestrator;
    }


    public ProjectResponseDto createProject(ProjectRequestDto requestDto) {
        Optional<Project> existing = projectRepository.findByRepositoryUrl(requestDto.getRepositoryUrl());

        if (existing.isPresent()) {
            Project existingProject = existing.get();

            boolean canRetry = existingProject.getStatus() == ProjectStatus.FAILED;

            if (!canRetry) {
                throw new DuplicateProjectException(requestDto.getRepositoryUrl());
            }

            // Previously failed — reset it so the user can retry instead of being stuck.
            existingProject.setStatus(ProjectStatus.PENDING);
            existingProject.setErrorMessage(null);
            existingProject.setUploadedAt(LocalDateTime.now());
            Project saved = projectRepository.save(existingProject);
            return toResponseDto(saved);
        }

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


    // add analysisOrchestrator to the constructor, remove the analyzer/downloader
    // fields that moved into AnalysisOrchestrator (repositoryDownloader, javaFileScanner,
    // javaCodeParser, codeExtractor, dependencyAnalyzer, dependencyRepository) —
    // ProjectService no longer needs them directly.

    public ProjectResponseDto startAnalysis(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

        boolean alreadyInProgress = project.getStatus() == ProjectStatus.CLONING
                || project.getStatus() == ProjectStatus.PARSING
                || project.getStatus() == ProjectStatus.ANALYZING_DEPENDENCIES;

        if (alreadyInProgress) {
            throw new AnalysisInProgressException(id);
        }

        project.setStatus(ProjectStatus.PENDING);
        projectRepository.save(project);

        analysisOrchestrator.runAnalysis(id); // fire-and-forget: returns immediately

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
                project.getStatus(),
                project.getErrorMessage()
        );
    }
}