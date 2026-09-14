package com.example.codebasearchaeologist.repository;

public interface SemanticSearchResult {
    Long getClassId();
    String getContent();
    Double getDistance();
}