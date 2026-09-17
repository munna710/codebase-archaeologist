package com.example.codebasearchaeologist.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    @Column(nullable = false)
    private String projectName;

    private String description;

    @Column(nullable = true)
    private String repositoryUrl;

    private LocalDateTime uploadedAt;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Enumerated(EnumType.STRING)
    private ProjectSourceType sourceType;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;



    public Project() {
    }

    // Getters and setters

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public void setRepositoryUrl(String repositoryUrl) {
        this.repositoryUrl = repositoryUrl;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public ProjectSourceType getSourceType() { return sourceType; }
    public void setSourceType(ProjectSourceType sourceType) { this.sourceType = sourceType; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}