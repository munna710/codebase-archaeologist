package com.example.codebasearchaeologist.dto;

import java.util.List;

public class ChatAnswerDto {

    private String answer;
    private List<RelevantClassDto> relevantClasses;

    public ChatAnswerDto(String answer, List<RelevantClassDto> relevantClasses) {
        this.answer = answer;
        this.relevantClasses = relevantClasses;
    }

    public String getAnswer() { return answer; }
    public List<RelevantClassDto> getRelevantClasses() { return relevantClasses; }
}