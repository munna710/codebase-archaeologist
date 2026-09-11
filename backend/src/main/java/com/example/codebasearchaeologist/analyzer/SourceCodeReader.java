package com.example.codebasearchaeologist.analyzer;

import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class SourceCodeReader {

    private static final int MAX_CHARACTERS = 6000; // keeps prompts small and cheap

    public String readSource(String filePath) {
        try {
            String content = Files.readString(Path.of(filePath));
            if (content.length() > MAX_CHARACTERS) {
                return content.substring(0, MAX_CHARACTERS) + "\n... (truncated for length)";
            }
            return content;
        } catch (IOException e) {
            return "(source code unavailable: " + e.getMessage() + ")";
        }
    }
}