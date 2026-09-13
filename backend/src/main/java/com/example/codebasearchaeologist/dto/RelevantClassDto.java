package com.example.codebasearchaeologist.dto;

public class RelevantClassDto {

    private Long classId;
    private String className;
    private String packageName;
    private String documentationSnippet; // may be null if not yet generated
    private int relevanceScore;

    public RelevantClassDto(Long classId, String className, String packageName,
                             String documentationSnippet, int relevanceScore) {
        this.classId = classId;
        this.className = className;
        this.packageName = packageName;
        this.documentationSnippet = documentationSnippet;
        this.relevanceScore = relevanceScore;
    }

    public Long getClassId() { return classId; }
    public String getClassName() { return className; }
    public String getPackageName() { return packageName; }
    public String getDocumentationSnippet() { return documentationSnippet; }
    public int getRelevanceScore() { return relevanceScore; }
}