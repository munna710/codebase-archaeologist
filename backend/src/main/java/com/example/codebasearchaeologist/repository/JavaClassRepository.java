package com.example.codebasearchaeologist.repository;

import com.example.codebasearchaeologist.entity.JavaClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JavaClassRepository extends JpaRepository<JavaClass, Long> {

    List<JavaClass> findByJavaFile_Project_ProjectId(Long projectId);

    @Query("""
        SELECT c.classId AS classId,
               c.className AS className,
               c.packageName AS packageName,
               COUNT(m) AS methodCount
        FROM JavaClass c
        LEFT JOIN c.methods m
        WHERE c.javaFile.project.projectId = :projectId
        GROUP BY c.classId, c.className, c.packageName
        """)
    List<ClassMethodCountProjection> findMethodCountsByProject(@Param("projectId") Long projectId);
}