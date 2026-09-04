package com.example.codebasearchaeologist.dto;

import jakarta.validation.constraints.NotBlank;

public class ProjectRequestDto {

    @NotBlank(message = "Repository URL is required")
    private String repositoryUrl;

    private String description;

    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public void setRepositoryUrl(String repositoryUrl) {
        this.repositoryUrl = repositoryUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}