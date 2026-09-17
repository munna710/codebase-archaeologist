package com.example.codebasearchaeologist.security;

import com.example.codebasearchaeologist.entity.Project;
import com.example.codebasearchaeologist.exception.ProjectNotFoundException;
import com.example.codebasearchaeologist.repository.ProjectRepository;
import org.springframework.stereotype.Component;

@Component
public class ProjectAccessGuard {

    private final ProjectRepository projectRepository;
    private final CurrentUserProvider currentUserProvider;

    public ProjectAccessGuard(ProjectRepository projectRepository, CurrentUserProvider currentUserProvider) {
        this.projectRepository = projectRepository;
        this.currentUserProvider = currentUserProvider;
    }

    /**
     * Loads a project and verifies it belongs to the current user. Every
     * service method that receives a projectId from a request should call
     * this first, rather than fetching the project directly — this is the
     * single place that enforces per-user isolation across the whole app.
     */
    public Project requireOwnedProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        Long currentUserId = currentUserProvider.getCurrentUserId();
        if (!project.getOwner().getUserId().equals(currentUserId)) {
            // Same project id, not yours -> 404, not 403, so existence isn't leaked.
            throw new ProjectNotFoundException(projectId);
        }

        return project;
    }
}