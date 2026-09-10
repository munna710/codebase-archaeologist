package com.example.codebasearchaeologist.repository;

import com.example.codebasearchaeologist.entity.JavaClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JavaClassRepository extends JpaRepository<JavaClass, Long> {
    List<JavaClass> findByJavaFile_Project_ProjectId(Long projectId);
}