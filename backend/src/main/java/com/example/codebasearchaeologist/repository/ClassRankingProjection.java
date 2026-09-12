package com.example.codebasearchaeologist.repository;

public interface ClassRankingProjection {
    Long getClassId();
    String getClassName();
    String getPackageName();
    Long getDependentCount();
}