package com.example.codebasearchaeologist.dto;

public class DashboardStatsDto {

    private long totalProjects;
    private long totalFiles;
    private long totalClasses;
    private long totalMethods;
    private long totalDependencies;

    public DashboardStatsDto(long totalProjects, long totalFiles, long totalClasses,
                              long totalMethods, long totalDependencies) {
        this.totalProjects = totalProjects;
        this.totalFiles = totalFiles;
        this.totalClasses = totalClasses;
        this.totalMethods = totalMethods;
        this.totalDependencies = totalDependencies;
    }

    public long getTotalProjects() { return totalProjects; }
    public long getTotalFiles() { return totalFiles; }
    public long getTotalClasses() { return totalClasses; }
    public long getTotalMethods() { return totalMethods; }
    public long getTotalDependencies() { return totalDependencies; }
}