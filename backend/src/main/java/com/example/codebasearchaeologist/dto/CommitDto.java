package com.example.codebasearchaeologist.dto;

import java.time.LocalDateTime;

public class CommitDto {
    private String commitId;
    private String shortId;
    private String message;
    private String authorName;
    private LocalDateTime commitDate;

    public CommitDto(String commitId, String shortId, String message, String authorName, LocalDateTime commitDate) {
        this.commitId = commitId;
        this.shortId = shortId;
        this.message = message;
        this.authorName = authorName;
        this.commitDate = commitDate;
    }

    public String getCommitId() { return commitId; }
    public String getShortId() { return shortId; }
    public String getMessage() { return message; }
    public String getAuthorName() { return authorName; }
    public LocalDateTime getCommitDate() { return commitDate; }
}