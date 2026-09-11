package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.entity.Documentation;
import com.example.codebasearchaeologist.entity.Project;
import com.example.codebasearchaeologist.repository.DocumentationRepository;
import com.example.codebasearchaeologist.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarkdownExportService {

    private final ProjectRepository projectRepository;
    private final DocumentationRepository documentationRepository;

    public MarkdownExportService(ProjectRepository projectRepository,
                                   DocumentationRepository documentationRepository) {
        this.projectRepository = projectRepository;
        this.documentationRepository = documentationRepository;
    }

    public String generateMarkdown(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        List<Documentation> docs = documentationRepository.findByProject_ProjectId(projectId);

        StringBuilder md = new StringBuilder();

        md.append("# ").append(project.getProjectName()).append("\n\n");
        md.append("**Repository:** ").append(project.getRepositoryUrl()).append("\n\n");
        md.append("**Status:** ").append(project.getStatus()).append("\n\n");

        if (project.getDescription() != null && !project.getDescription().isBlank()) {
            md.append(project.getDescription()).append("\n\n");
        }

        md.append("---\n\n");
        md.append("## Class Documentation\n\n");

        if (docs.isEmpty()) {
            md.append("_No documentation has been generated for this project yet._\n");
        } else {
            for (Documentation doc : docs) {
                String heading = doc.getJavaClass() != null
                        ? doc.getJavaClass().getClassName()
                        : "Project Overview";

                md.append("### ").append(heading).append("\n\n");

                if (doc.getJavaClass() != null) {
                    md.append("**Package:** `").append(doc.getJavaClass().getPackageName()).append("`\n\n");
                }

                md.append(doc.getContent()).append("\n\n");
            }
        }

        return md.toString();
    }
}