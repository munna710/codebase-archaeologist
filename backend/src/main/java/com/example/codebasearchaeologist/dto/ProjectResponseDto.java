package com.example.codebasearchaeologist.dto;

import com.example.codebasearchaeologist.entity.ProjectStatus;
import java.time.LocalDateTime;

public class ProjectResponseDto {

    private Long projectId;
    private String projectName;
    private String description;
    private String repositoryUrl;
    private LocalDateTime uploadedAt;
    private ProjectStatus status;
    private String errorMessage;

    public ProjectResponseDto(Long projectId, String projectName, String description,
                              String repositoryUrl, LocalDateTime uploadedAt, ProjectStatus status, String errorMessage) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.description = description;
        this.repositoryUrl = repositoryUrl;
        this.uploadedAt = uploadedAt;
        this.status = status;

        this.errorMessage = errorMessage;
    }

    public Long getProjectId() { return projectId; }
    public String getProjectName() { return projectName; }
    public String getDescription() { return description; }
    public String getRepositoryUrl() { return repositoryUrl; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public ProjectStatus getStatus() { return status; }
    public String getErrorMessage() { return errorMessage; }
}