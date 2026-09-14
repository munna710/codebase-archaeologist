package com.example.codebasearchaeologist.analyzer;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class StackTraceParser {

    // Matches lines like: "at com.example.petclinic.owner.OwnerController.processCreationForm(OwnerController.java:89)"
    private static final Pattern STACK_FRAME_PATTERN =
            Pattern.compile("at\\s+[\\w.$]+\\.(\\w+)\\.\\w+\\(([\\w$]+)\\.java:(\\d+)\\)");

    // Matches the first line, e.g. "java.lang.NullPointerException: Cannot invoke..."
    private static final Pattern EXCEPTION_LINE_PATTERN =
            Pattern.compile("^([\\w.$]+(?:Exception|Error))(?::\\s*(.*))?");

    public ParsedStackTrace parse(String rawStackTrace) {
        String[] lines = rawStackTrace.strip().split("\n");

        String exceptionType = null;
        String exceptionMessage = null;
        Set<String> mentionedClassNames = new LinkedHashSet<>(); // preserves order, no duplicates

        for (String line : lines) {
            line = line.strip();

            Matcher exceptionMatcher = EXCEPTION_LINE_PATTERN.matcher(line);
            if (exceptionMatcher.find() && exceptionType == null) {
                String fullyQualified = exceptionMatcher.group(1);
                exceptionType = fullyQualified.substring(fullyQualified.lastIndexOf('.') + 1);
                exceptionMessage = exceptionMatcher.group(2);
                continue;
            }

            Matcher frameMatcher = STACK_FRAME_PATTERN.matcher(line);
            if (frameMatcher.find()) {
                String className = frameMatcher.group(2); // the ".java" file name, without extension
                mentionedClassNames.add(className);
            }
        }

        return new ParsedStackTrace(exceptionType, exceptionMessage, new ArrayList<>(mentionedClassNames));
    }

    public static class ParsedStackTrace {
        private final String exceptionType;
        private final String exceptionMessage;
        private final List<String> mentionedClassNames;

        public ParsedStackTrace(String exceptionType, String exceptionMessage, List<String> mentionedClassNames) {
            this.exceptionType = exceptionType;
            this.exceptionMessage = exceptionMessage;
            this.mentionedClassNames = mentionedClassNames;
        }

        public String getExceptionType() { return exceptionType; }
        public String getExceptionMessage() { return exceptionMessage; }
        public List<String> getMentionedClassNames() { return mentionedClassNames; }
    }
}