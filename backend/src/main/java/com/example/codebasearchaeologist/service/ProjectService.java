package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.analyzer.RepositoryDownloader;
import com.example.codebasearchaeologist.dto.ProjectRequestDto;
import com.example.codebasearchaeologist.dto.ProjectResponseDto;
import com.example.codebasearchaeologist.entity.Project;
import com.example.codebasearchaeologist.entity.ProjectStatus;
import com.example.codebasearchaeologist.exception.RepositoryDownloadException;
import com.example.codebasearchaeologist.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import com.example.codebasearchaeologist.analyzer.JavaFileScanner;
import com.example.codebasearchaeologist.analyzer.JavaCodeParser;
import com.github.javaparser.JavaParser;
import com.github.javaparser.ast.CompilationUnit;
import java.util.Optional;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final RepositoryDownloader repositoryDownloader;
    private final JavaFileScanner javaFileScanner;
    private final JavaCodeParser javaCodeParser;

    public ProjectService(ProjectRepository projectRepository,
                          RepositoryDownloader repositoryDownloader,
                          JavaFileScanner javaFileScanner,
                          JavaCodeParser javaCodeParser) {
        this.projectRepository = projectRepository;
        this.repositoryDownloader = repositoryDownloader;
        this.javaFileScanner = javaFileScanner;
        this.javaCodeParser = javaCodeParser;
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
            System.out.println("Cloned repository to: " + clonedDir.getAbsolutePath());

            List<File> javaFiles = javaFileScanner.findJavaFiles(clonedDir);
            System.out.println("Found " + javaFiles.size() + " Java files");

            JavaParser parser = javaCodeParser.buildParser(clonedDir);

            int parsedCount = 0;
            for (File javaFile : javaFiles) {
                Optional<CompilationUnit> cuOpt = javaCodeParser.parseFile(parser, javaFile);
                if (cuOpt.isPresent()) {
                    parsedCount++;
                    CompilationUnit cu = cuOpt.get();
                    String packageName = cu.getPackageDeclaration()
                            .map(pd -> pd.getNameAsString())
                            .orElse("(default package)");
                    System.out.println("Parsed: " + javaFile.getName() + " | package: " + packageName);
                }
            }

            System.out.println("Successfully parsed " + parsedCount + " / " + javaFiles.size() + " files");

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