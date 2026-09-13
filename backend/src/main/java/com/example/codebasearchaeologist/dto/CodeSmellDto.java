package com.example.codebasearchaeologist.dto;

public class CodeSmellDto {

    private Long classId;
    private String className;
    private String smellType;
    private String description;
    private String severity; // "LOW", "MEDIUM", "HIGH"

    public CodeSmellDto(Long classId, String className, String smellType, String description, String severity) {
        this.classId = classId;
        this.className = className;
        this.smellType = smellType;
        this.description = description;
        this.severity = severity;
    }

    public Long getClassId() { return classId; }
    public String getClassName() { return className; }
    public String getSmellType() { return smellType; }
    public String getDescription() { return description; }
    public String getSeverity() { return severity; }
}