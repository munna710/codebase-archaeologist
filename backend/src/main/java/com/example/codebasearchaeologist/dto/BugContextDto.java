package com.example.codebasearchaeologist.dto;

import java.util.List;

public class BugContextDto {

    private String exceptionType;
    private String exceptionMessage;
    private List<RelevantClassDto> likelyClasses;
    private String aiAnalysis;

    public BugContextDto(String exceptionType, String exceptionMessage,
                          List<RelevantClassDto> likelyClasses, String aiAnalysis) {
        this.exceptionType = exceptionType;
        this.exceptionMessage = exceptionMessage;
        this.likelyClasses = likelyClasses;
        this.aiAnalysis = aiAnalysis;
    }

    public String getExceptionType() { return exceptionType; }
    public String getExceptionMessage() { return exceptionMessage; }
    public List<RelevantClassDto> getLikelyClasses() { return likelyClasses; }
    public String getAiAnalysis() { return aiAnalysis; }
}