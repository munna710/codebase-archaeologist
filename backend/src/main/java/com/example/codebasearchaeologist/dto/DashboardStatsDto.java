package com.example.codebasearchaeologist.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DashboardStatsDto {

    private long totalProjects;
    private long totalFiles;
    private long totalClasses;
    private long totalMethods;
    private long totalDependencies;
    private long totalCodeSmells;
    private long completedProjects;
    private long failedProjects;
    private long inProgressProjects;

    private List<ProjectSummaryDto> projects; // per-project breakdown, most recent first

    private String topComplexClassName;
    private String topComplexClassPackage;
    private long topComplexClassScore;
    private Long topComplexClassId;
    private Long topComplexClassProjectId;
    private String topComplexClassProjectName;

    public DashboardStatsDto(long totalProjects, long totalFiles, long totalClasses, long totalMethods,
                             long totalDependencies, long totalCodeSmells, long completedProjects,
                             long failedProjects, long inProgressProjects, List<ProjectSummaryDto> projects,
                             String topComplexClassName, String topComplexClassPackage, long topComplexClassScore,
                             Long topComplexClassId, Long topComplexClassProjectId, String topComplexClassProjectName) {
        this.totalProjects = totalProjects;
        this.totalFiles = totalFiles;
        this.totalClasses = totalClasses;
        this.totalMethods = totalMethods;
        this.totalDependencies = totalDependencies;
        this.totalCodeSmells = totalCodeSmells;
        this.completedProjects = completedProjects;
        this.failedProjects = failedProjects;
        this.inProgressProjects = inProgressProjects;
        this.projects = projects;
        this.topComplexClassName = topComplexClassName;
        this.topComplexClassPackage = topComplexClassPackage;
        this.topComplexClassScore = topComplexClassScore;
        this.topComplexClassId = topComplexClassId;
        this.topComplexClassProjectId = topComplexClassProjectId;
        this.topComplexClassProjectName = topComplexClassProjectName;
    }

    public long getTotalProjects() { return totalProjects; }
    public long getTotalFiles() { return totalFiles; }
    public long getTotalClasses() { return totalClasses; }
    public long getTotalMethods() { return totalMethods; }
    public long getTotalDependencies() { return totalDependencies; }
    public long getTotalCodeSmells() { return totalCodeSmells; }
    public long getCompletedProjects() { return completedProjects; }
    public long getFailedProjects() { return failedProjects; }
    public long getInProgressProjects() { return inProgressProjects; }
    public List<ProjectSummaryDto> getProjects() { return projects; }
    public String getTopComplexClassName() { return topComplexClassName; }
    public String getTopComplexClassPackage() { return topComplexClassPackage; }
    public long getTopComplexClassScore() { return topComplexClassScore; }
    public Long getTopComplexClassId() { return topComplexClassId; }
    public Long getTopComplexClassProjectId() { return topComplexClassProjectId; }
    public String getTopComplexClassProjectName() { return topComplexClassProjectName; }

    public static class ProjectSummaryDto {
        private Long projectId;
        private String projectName;
        private String status;
        private long fileCount;
        private long classCount;
        private long smellCount;
        private LocalDateTime uploadedAt;

        public ProjectSummaryDto(Long projectId, String projectName, String status, long fileCount,
                                 long classCount, long smellCount, LocalDateTime uploadedAt) {
            this.projectId = projectId;
            this.projectName = projectName;
            this.status = status;
            this.fileCount = fileCount;
            this.classCount = classCount;
            this.smellCount = smellCount;
            this.uploadedAt = uploadedAt;
        }

        public Long getProjectId() { return projectId; }
        public String getProjectName() { return projectName; }
        public String getStatus() { return status; }
        public long getFileCount() { return fileCount; }
        public long getClassCount() { return classCount; }
        public long getSmellCount() { return smellCount; }
        public LocalDateTime getUploadedAt() { return uploadedAt; }
    }
}