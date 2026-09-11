package com.example.codebasearchaeologist.config;

import jakarta.annotation.PreDestroy;
import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

@Component
public class TempDirCleanupConfig {

    @PreDestroy
    public void cleanupAllTempRepos() {
        File tempRoot = new File(System.getProperty("java.io.tmpdir"));
        File[] repoFolders = tempRoot.listFiles((dir, name) -> name.startsWith("repo-"));

        if (repoFolders == null) return;

        for (File folder : repoFolders) {
            try {
                FileUtils.deleteDirectory(folder);
            } catch (IOException e) {
                System.err.println("Could not delete: " + folder.getAbsolutePath());
            }
        }
    }
}