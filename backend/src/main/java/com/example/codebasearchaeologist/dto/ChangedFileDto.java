package com.example.codebasearchaeologist.dto;

public class ChangedFileDto {
    private String filePath;
    private String changeType; // ADD, MODIFY, DELETE, RENAME

    public ChangedFileDto(String filePath, String changeType) {
        this.filePath = filePath;
        this.changeType = changeType;
    }

    public String getFilePath() { return filePath; }
    public String getChangeType() { return changeType; }
}