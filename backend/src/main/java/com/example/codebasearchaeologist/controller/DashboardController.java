package com.example.codebasearchaeologist.controller;

import com.example.codebasearchaeologist.dto.DashboardStatsDto;
import com.example.codebasearchaeologist.repository.*;
import com.example.codebasearchaeologist.security.CurrentUserProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    private final ProjectRepository projectRepository;
    private final JavaFileRepository javaFileRepository;
    private final JavaClassRepository javaClassRepository;
    private final JavaMethodRepository javaMethodRepository;
    private final DependencyRepository dependencyRepository;
    private final CurrentUserProvider currentUserProvider;

    public DashboardController(ProjectRepository projectRepository,
                               JavaFileRepository javaFileRepository,
                               JavaClassRepository javaClassRepository,
                               JavaMethodRepository javaMethodRepository,
                               DependencyRepository dependencyRepository,
                               CurrentUserProvider currentUserProvider) {
        this.projectRepository = projectRepository;
        this.javaFileRepository = javaFileRepository;
        this.javaClassRepository = javaClassRepository;
        this.javaMethodRepository = javaMethodRepository;
        this.dependencyRepository = dependencyRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @GetMapping("/api/dashboard/stats")
    public DashboardStatsDto getStats() {
        Long userId = currentUserProvider.getCurrentUserId();

        return new DashboardStatsDto(
                projectRepository.countByOwner_UserId(userId),
                javaFileRepository.countByProject_Owner_UserId(userId),
                javaClassRepository.countByJavaFile_Project_Owner_UserId(userId),
                javaMethodRepository.countByJavaClass_JavaFile_Project_Owner_UserId(userId),
                dependencyRepository.countBySourceClass_JavaFile_Project_Owner_UserId(userId)
        );
    }
}