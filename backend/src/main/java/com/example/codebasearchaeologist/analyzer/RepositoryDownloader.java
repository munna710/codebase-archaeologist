package com.example.codebasearchaeologist.analyzer;

import com.example.codebasearchaeologist.exception.RepositoryDownloadException;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

@Component
public class RepositoryDownloader {

    private static final Pattern GITHUB_URL_PATTERN =
            Pattern.compile("^https://github\\.com/[\\w.-]+/[\\w.-]+/?(\\.git)?$");

    public boolean isValidGitHubUrl(String url) {
        return url != null && GITHUB_URL_PATTERN.matcher(url.trim()).matches();
    }

    public File cloneRepository(String repositoryUrl, Long projectId) {
        if (!isValidGitHubUrl(repositoryUrl)) {
            throw new RepositoryDownloadException("Invalid GitHub repository URL: " + repositoryUrl);
        }

        Path tempDir;
        try {
            tempDir = Files.createTempDirectory("repo-" + projectId + "-");
        } catch (IOException e) {
            throw new RepositoryDownloadException("Could not create temporary directory for cloning", e);
        }

        File targetDir = tempDir.toFile();

        try (Git git = Git.cloneRepository()
                .setURI(repositoryUrl)
                .setDirectory(targetDir)
                .setDepth(1) // shallow clone: only latest commit, no full history
                .call()) {

            return targetDir;

        } catch (InvalidRemoteException e) {
            throw new RepositoryDownloadException("Repository does not exist or is not accessible: " + repositoryUrl, e);
        } catch (GitAPIException e) {
            throw new RepositoryDownloadException("Failed to clone repository: " + e.getMessage(), e);
        }
    }
}