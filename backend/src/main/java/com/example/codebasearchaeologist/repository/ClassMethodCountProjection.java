package com.example.codebasearchaeologist.repository;

public interface ClassMethodCountProjection {
    Long getClassId();
    String getClassName();
    String getPackageName();
    Long getMethodCount();
}