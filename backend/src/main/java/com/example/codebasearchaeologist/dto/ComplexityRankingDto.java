package com.example.codebasearchaeologist.dto;

public class ComplexityRankingDto {

    private Long classId;
    private String className;
    private String packageName;
    private long methodCount;
    private long dependencyCount;
    private long complexityScore;

    public ComplexityRankingDto(Long classId, String className, String packageName,
                                  long methodCount, long dependencyCount, long complexityScore) {
        this.classId = classId;
        this.className = className;
        this.packageName = packageName;
        this.methodCount = methodCount;
        this.dependencyCount = dependencyCount;
        this.complexityScore = complexityScore;
    }

    public Long getClassId() { return classId; }
    public String getClassName() { return className; }
    public String getPackageName() { return packageName; }
    public long getMethodCount() { return methodCount; }
    public long getDependencyCount() { return dependencyCount; }
    public long getComplexityScore() { return complexityScore; }
}