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

    public List<File> findJavaFiles(File rootDirectory) {
        try (Stream<Path> paths = Files.walk(rootDirectory.toPath())) {
            return paths
                    .filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".java"))
                    .filter(path -> !path.toString().contains("/target/")) // skip Maven build output
                    .filter(path -> !path.toString().contains("/build/"))  // skip Gradle build output
                    .filter(path -> !path.toString().contains("/test/"))   // skip test files for now
                    .map(Path::toFile)
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Failed to scan directory for Java files: " + e.getMessage(), e);
        }
    }
}