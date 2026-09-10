package com.example.codebasearchaeologist.controller;

import com.example.codebasearchaeologist.dto.ProjectRequestDto;
import com.example.codebasearchaeologist.dto.ProjectResponseDto;
import com.example.codebasearchaeologist.entity.Dependency;
import com.example.codebasearchaeologist.entity.JavaFile;
import com.example.codebasearchaeologist.repository.DependencyRepository;
import com.example.codebasearchaeologist.repository.JavaFileRepository;
import com.example.codebasearchaeologist.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final JavaFileRepository javaFileRepository;
    private final DependencyRepository dependencyRepository;

    public ProjectController(ProjectService projectService, JavaFileRepository javaFileRepository, DependencyRepository dependencyRepository) {
        this.projectService = projectService;
        this.javaFileRepository = javaFileRepository;
        this.dependencyRepository = dependencyRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponseDto createProject(@Valid @RequestBody ProjectRequestDto requestDto) {
        return projectService.createProject(requestDto);
    }

    @GetMapping
    public List<ProjectResponseDto> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ProjectResponseDto getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    @PostMapping("/{id}/analyze")
    public ProjectResponseDto analyzeProject(@PathVariable Long id) {
        return projectService.analyzeProject(id);
    }


    @GetMapping("/{id}/files")
    public List<JavaFile> getProjectFiles(@PathVariable Long id) {
        return javaFileRepository.findByProject_ProjectId(id);
    }

    @GetMapping("/{id}/dependencies")
    public List<Dependency> getProjectDependencies(@PathVariable Long id) {
        return dependencyRepository.findBySourceClass_JavaFile_Project_ProjectId(id);
    }
}