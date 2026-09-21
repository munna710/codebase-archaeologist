package com.example.codebasearchaeologist.controller;

import com.example.codebasearchaeologist.dto.CodeSmellDto;
import com.example.codebasearchaeologist.dto.ComplexityRankingDto;
import com.example.codebasearchaeologist.dto.DashboardStatsDto;
import com.example.codebasearchaeologist.entity.Project;
import com.example.codebasearchaeologist.repository.*;
import com.example.codebasearchaeologist.security.CurrentUserProvider;
import com.example.codebasearchaeologist.service.ClassDetailsService;
import com.example.codebasearchaeologist.service.CodeSmellService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
public class DashboardController {

    private final ProjectRepository projectRepository;
    private final JavaFileRepository javaFileRepository;
    private final JavaClassRepository javaClassRepository;
    private final JavaMethodRepository javaMethodRepository;
    private final DependencyRepository dependencyRepository;
    private final CodeSmellService codeSmellService;
    private final ClassDetailsService classDetailsService;
    private final CurrentUserProvider currentUserProvider;

    public DashboardController(ProjectRepository projectRepository,
                               JavaFileRepository javaFileRepository,
                               JavaClassRepository javaClassRepository,
                               JavaMethodRepository javaMethodRepository,
                               DependencyRepository dependencyRepository,
                               CodeSmellService codeSmellService,
                               ClassDetailsService classDetailsService,
                               CurrentUserProvider currentUserProvider) {
        this.projectRepository = projectRepository;
        this.javaFileRepository = javaFileRepository;
        this.javaClassRepository = javaClassRepository;
        this.javaMethodRepository = javaMethodRepository;
        this.dependencyRepository = dependencyRepository;
        this.codeSmellService = codeSmellService;
        this.classDetailsService = classDetailsService;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/api/dashboard/stats")
    public DashboardStatsDto getStats() {
        Long userId = currentUserProvider.getCurrentUserId();
        List<Project> userProjects = projectRepository.findByOwner_UserId(userId);

        long completed = userProjects.stream().filter(p -> p.getStatus().name().equals("COMPLETED")).count();
        long failed = userProjects.stream().filter(p -> p.getStatus().name().equals("FAILED")).count();
        long inProgress = userProjects.size() - completed - failed;

        long totalSmells = 0;

        String topComplexClassName = null;
        String topComplexClassPackage = null;
        long topComplexClassScore = -1;
        Long topComplexClassId = null;
        Long topComplexClassProjectId = null;
        String topComplexClassProjectName = null;

        List<DashboardStatsDto.ProjectSummaryDto> summaries = new ArrayList<>();

        for (Project project : userProjects) {
            long fileCount = javaFileRepository.findByProject_ProjectId(project.getProjectId()).size();
            long classCount = javaClassRepository.findByJavaFile_Project_ProjectId(project.getProjectId()).size();

            List<CodeSmellDto> smells = project.getStatus().name().equals("COMPLETED")
                    ? codeSmellService.detectSmells(project.getProjectId())
                    : List.of();
            totalSmells += smells.size();

            if (project.getStatus().name().equals("COMPLETED")) {
                List<ComplexityRankingDto> ranking = classDetailsService.getMostComplexClasses(project.getProjectId());
                if (!ranking.isEmpty()) {
                    ComplexityRankingDto candidate = ranking.get(0);
                    if (candidate.getComplexityScore() > topComplexClassScore) {
                        topComplexClassScore = candidate.getComplexityScore();
                        topComplexClassName = candidate.getClassName();
                        topComplexClassPackage = candidate.getPackageName();
                        topComplexClassId = candidate.getClassId();
                        topComplexClassProjectId = project.getProjectId();
                        topComplexClassProjectName = project.getProjectName();
                    }
                }
            }

            summaries.add(new DashboardStatsDto.ProjectSummaryDto(
                    project.getProjectId(), project.getProjectName(), project.getStatus().name(),
                    fileCount, classCount, smells.size(), project.getUploadedAt()));
        }

        summaries.sort(Comparator.comparing(DashboardStatsDto.ProjectSummaryDto::getUploadedAt).reversed());

        return new DashboardStatsDto(
                userProjects.size(),
                javaFileRepository.countByProject_Owner_UserId(userId),
                javaClassRepository.countByJavaFile_Project_Owner_UserId(userId),
                javaMethodRepository.countByJavaClass_JavaFile_Project_Owner_UserId(userId),
                dependencyRepository.countBySourceClass_JavaFile_Project_Owner_UserId(userId),
                totalSmells,
                completed, failed, inProgress,
                summaries,
                topComplexClassName,
                topComplexClassPackage,
                topComplexClassScore < 0 ? 0 : topComplexClassScore,
                topComplexClassId,
                topComplexClassProjectId,
                topComplexClassProjectName
        );
    }
}