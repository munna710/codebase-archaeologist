package com.example.codebasearchaeologist.analyzer;

import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class JavaFileScanner {

    private static final int MAX_FILES = 500;

    public List<File> findJavaFiles(File rootDirectory) {
        try (Stream<Path> paths = Files.walk(rootDirectory.toPath())) {
            List<File> files = paths
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".java"))
                    .filter(path -> !path.toString().contains("/target/"))
                    .filter(path -> !path.toString().contains("/build/"))
                    .filter(path -> !path.toString().contains("/test/"))
                    .map(Path::toFile)
                    .collect(Collectors.toList());

            if (files.size() > MAX_FILES) {
                System.out.println("Repository has " + files.size() + " files; limiting analysis to first " + MAX_FILES);
                return files.subList(0, MAX_FILES);
            }

            return files;
        } catch (IOException e) {
            throw new RuntimeException("Failed to scan directory for Java files: " + e.getMessage(), e);
        }
    }
}