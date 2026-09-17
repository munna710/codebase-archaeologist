package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.analyzer.CodeExtractor;
import com.example.codebasearchaeologist.analyzer.JavaCodeParser;
import com.example.codebasearchaeologist.analyzer.JavaFileScanner;
import com.example.codebasearchaeologist.analyzer.RepositoryDownloader;
import com.example.codebasearchaeologist.dto.ProjectRequestDto;
import com.example.codebasearchaeologist.dto.ProjectResponseDto;
import com.example.codebasearchaeologist.entity.*;
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
import com.example.codebasearchaeologist.repository.DependencyRepository;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import org.springframework.web.multipart.MultipartFile;
import com.example.codebasearchaeologist.repository.DocumentationRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
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
    private final DocumentationRepository documentationRepository;


    public ProjectService(ProjectRepository projectRepository,
                          JavaFileRepository javaFileRepository,
                          RepositoryDownloader repositoryDownloader,
                          JavaFileScanner javaFileScanner,
                          JavaCodeParser javaCodeParser,
                          CodeExtractor codeExtractor,
                          DependencyAnalyzer dependencyAnalyzer,
                          DependencyRepository dependencyRepository, AnalysisOrchestrator analysisOrchestrator, DocumentationRepository documentationRepository) {
        this.projectRepository = projectRepository;
        this.javaFileRepository = javaFileRepository;
        this.repositoryDownloader = repositoryDownloader;
        this.javaFileScanner = javaFileScanner;
        this.javaCodeParser = javaCodeParser;
        this.codeExtractor = codeExtractor;
        this.dependencyAnalyzer = dependencyAnalyzer;
        this.dependencyRepository = dependencyRepository;
        this.analysisOrchestrator = analysisOrchestrator;
        this.documentationRepository = documentationRepository;
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
        project.setSourceType(ProjectSourceType.GITHUB);  // <-- ADD THIS
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
                project.getSourceType(),
                project.getUploadedAt(),
                project.getStatus(),
                project.getErrorMessage()
        );
    }

    private static final Path UPLOAD_STAGING_DIR = Path.of(System.getProperty("java.io.tmpdir"), "zip-uploads");

    public ProjectResponseDto createProjectFromZip(MultipartFile file, String description) {
        if (file == null || file.isEmpty()) {
            throw new RepositoryDownloadException("No ZIP file was provided.");
        }
        if (!file.getOriginalFilename().toLowerCase().endsWith(".zip")) {
            throw new RepositoryDownloadException("Uploaded file must be a .zip file.");
        }

        String derivedName = file.getOriginalFilename().replace(".zip", "");

        Project project = new Project();
        project.setProjectName(derivedName);
        project.setDescription(description);
        project.setRepositoryUrl(null);
        project.setSourceType(ProjectSourceType.ZIP_UPLOAD);
        project.setUploadedAt(LocalDateTime.now());
        project.setStatus(ProjectStatus.PENDING);

        Project saved = projectRepository.save(project);

        // Copy the upload's bytes to a durable location now, synchronously,
        // since the background analysis thread will need them later and
        // Spring's MultipartFile temp storage won't survive past this request.
        try {
            Files.createDirectories(UPLOAD_STAGING_DIR);
            Path stagedFile = UPLOAD_STAGING_DIR.resolve("project-" + saved.getProjectId() + ".zip");
            file.transferTo(stagedFile);
        } catch (IOException e) {
            saved.setStatus(ProjectStatus.FAILED);
            saved.setErrorMessage("Failed to save uploaded file: " + e.getMessage());
            projectRepository.save(saved);
            throw new RepositoryDownloadException("Failed to save uploaded file.", e);
        }

        return toResponseDto(saved);
    }

    public ProjectResponseDto reanalyzeProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));

//        assertOwnership(project);

        boolean alreadyInProgress = project.getStatus() == ProjectStatus.CLONING
                || project.getStatus() == ProjectStatus.PARSING
                || project.getStatus() == ProjectStatus.ANALYZING_DEPENDENCIES;

        if (alreadyInProgress) {
            throw new AnalysisInProgressException(id);
        }

        // Order matters here: dependencies and documentation both hold foreign
        // keys pointing at classes, so they must be deleted — and flushed to
        // the database — before the classes (and the files that cascade-delete
        // them) are removed, or PostgreSQL rejects the class deletion with a
        // foreign key violation.
        List<Dependency> existingDependencies = dependencyRepository.findBySourceClass_JavaFile_Project_ProjectId(id);
        dependencyRepository.deleteAll(existingDependencies);
        dependencyRepository.flush();

        List<Documentation> existingDocs = documentationRepository.findByProject_ProjectId(id);
        documentationRepository.deleteAll(existingDocs);
        documentationRepository.flush();

        List<JavaFile> existingFiles = javaFileRepository.findByProject_ProjectId(id);
        javaFileRepository.deleteAll(existingFiles);
        javaFileRepository.flush();

        project.setStatus(ProjectStatus.PENDING);
        project.setErrorMessage(null);
        project.setUploadedAt(LocalDateTime.now());
        projectRepository.save(project);

        analysisOrchestrator.runAnalysis(id);

        return toResponseDto(project);
    }
}