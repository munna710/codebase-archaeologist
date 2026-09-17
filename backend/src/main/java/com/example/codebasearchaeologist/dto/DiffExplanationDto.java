package com.example.codebasearchaeologist.dto;

import java.util.List;

public class DiffExplanationDto {
    private String fromCommit;
    private String toCommit;
    private List<ChangedFileDto> changedFiles;
    private List<RelevantClassDto> affectedClasses;
    private String aiExplanation;

    public DiffExplanationDto(String fromCommit, String toCommit, List<ChangedFileDto> changedFiles,
                               List<RelevantClassDto> affectedClasses, String aiExplanation) {
        this.fromCommit = fromCommit;
        this.toCommit = toCommit;
        this.changedFiles = changedFiles;
        this.affectedClasses = affectedClasses;
        this.aiExplanation = aiExplanation;
    }

    public String getFromCommit() { return fromCommit; }
    public String getToCommit() { return toCommit; }
    public List<ChangedFileDto> getChangedFiles() { return changedFiles; }
    public List<RelevantClassDto> getAffectedClasses() { return affectedClasses; }
    public String getAiExplanation() { return aiExplanation; }
}