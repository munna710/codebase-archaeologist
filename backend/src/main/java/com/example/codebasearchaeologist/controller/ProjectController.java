package com.example.codebasearchaeologist.controller;

import com.example.codebasearchaeologist.dto.ClassDetailsDto;
import com.example.codebasearchaeologist.dto.ProjectRequestDto;
import com.example.codebasearchaeologist.dto.ProjectResponseDto;
import com.example.codebasearchaeologist.entity.Dependency;
import com.example.codebasearchaeologist.entity.Documentation;
import com.example.codebasearchaeologist.entity.JavaFile;
import com.example.codebasearchaeologist.repository.ClassRankingProjection;
import com.example.codebasearchaeologist.repository.DependencyRepository;
import com.example.codebasearchaeologist.repository.JavaFileRepository;
import com.example.codebasearchaeologist.service.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final JavaFileRepository javaFileRepository;
    private final DependencyRepository dependencyRepository;
    private final DocumentationService documentationService;
    private final MarkdownExportService markdownExportService;
    private final PdfExportService pdfExportService;
    private final ClassDetailsService classDetailsService;

    public ProjectController(ProjectService projectService,
                             JavaFileRepository javaFileRepository,
                             DependencyRepository dependencyRepository,
                             DocumentationService documentationService, MarkdownExportService markdownExportService, PdfExportService pdfExportService, ClassDetailsService classDetailsService) {
        this.projectService = projectService;
        this.javaFileRepository = javaFileRepository;
        this.dependencyRepository = dependencyRepository;
        this.documentationService = documentationService;
        this.markdownExportService = markdownExportService;
        this.pdfExportService = pdfExportService;
        this.classDetailsService = classDetailsService;
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

    @PostMapping("/{id}/generate-documentation")
    public List<Documentation> generateDocumentation(@PathVariable Long id) {
        return documentationService.generateDocumentationForProject(id);
    }

    @GetMapping("/{id}/documentation")
    public List<Documentation> getDocumentation(@PathVariable Long id) {
        return documentationService.getDocumentationForProject(id);
    }

    @GetMapping("/{id}/export/markdown")
    public ResponseEntity<String> exportMarkdown(@PathVariable Long id) {
        String markdown = markdownExportService.generateMarkdown(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=documentation.md")
                .contentType(MediaType.parseMediaType("text/markdown"))
                .body(markdown);
    }

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) throws IOException {
        String markdown = markdownExportService.generateMarkdown(id);
        byte[] pdfBytes = pdfExportService.convertMarkdownToPdf(markdown);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=documentation.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/{id}/classes/{classId}")
    public ClassDetailsDto getClassDetails(@PathVariable Long id, @PathVariable Long classId) {
        return classDetailsService.getClassDetails(classId);
    }

    @GetMapping("/{id}/classes/ranking")
    public List<ClassRankingProjection> getClassRanking(@PathVariable Long id) {
        return classDetailsService.getMostDependedUponClasses(id);
    }

}