package com.example.codebasearchaeologist.controller;

import com.example.codebasearchaeologist.dto.DashboardStatsDto;
import com.example.codebasearchaeologist.repository.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    private final ProjectRepository projectRepository;
    private final JavaFileRepository javaFileRepository;
    private final JavaClassRepository javaClassRepository;
    private final JavaMethodRepository javaMethodRepository;
    private final DependencyRepository dependencyRepository;

    public DashboardController(ProjectRepository projectRepository,
                                JavaFileRepository javaFileRepository,
                                JavaClassRepository javaClassRepository,
                                JavaMethodRepository javaMethodRepository,
                                DependencyRepository dependencyRepository) {
        this.projectRepository = projectRepository;
        this.javaFileRepository = javaFileRepository;
        this.javaClassRepository = javaClassRepository;
        this.javaMethodRepository = javaMethodRepository;
        this.dependencyRepository = dependencyRepository;
    }

    @GetMapping("/api/dashboard/stats")
    public DashboardStatsDto getStats() {
        return new DashboardStatsDto(
                projectRepository.count(),
                javaFileRepository.count(),
                javaClassRepository.count(),
                javaMethodRepository.count(),
                dependencyRepository.count()
        );
    }
}