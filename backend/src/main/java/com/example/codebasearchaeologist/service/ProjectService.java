package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.analyzer.RepositoryDownloader;
import com.example.codebasearchaeologist.dto.ProjectRequestDto;
import com.example.codebasearchaeologist.dto.ProjectResponseDto;
import com.example.codebasearchaeologist.entity.Project;
import com.example.codebasearchaeologist.entity.ProjectStatus;
import com.example.codebasearchaeologist.exception.RepositoryDownloadException;
import com.example.codebasearchaeologist.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final RepositoryDownloader repositoryDownloader;

    public ProjectService(ProjectRepository projectRepository, RepositoryDownloader repositoryDownloader) {
        this.projectRepository = projectRepository;
        this.repositoryDownloader = repositoryDownloader;
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

            // For now, just confirm it worked. JavaParser analysis comes in Milestone 7.
            System.out.println("Cloned repository to: " + clonedDir.getAbsolutePath());

            // Status stays ANALYZING until parsing (next milestone) completes it.
            projectRepository.save(project);

        } catch (RepositoryDownloadException e) {
            project.setStatus(ProjectStatus.FAILED);
            projectRepository.save(project);
            throw e; // re-throw so the controller/frontend knows it failed
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