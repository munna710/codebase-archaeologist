package com.example.codebasearchaeologist.repository;

import com.example.codebasearchaeologist.entity.Dependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DependencyRepository extends JpaRepository<Dependency, Long> {
    List<Dependency> findBySourceClass_JavaFile_Project_ProjectId(Long projectId);
    List<Dependency> findByTargetClass_ClassId(Long classId);
    List<Dependency> findBySourceClass_ClassId(Long classId);

    @Query("""
        SELECT d.targetClass.classId AS classId,
               d.targetClass.className AS className,
               d.targetClass.packageName AS packageName,
               COUNT(d) AS dependentCount
        FROM Dependency d
        WHERE d.targetClass.javaFile.project.projectId = :projectId
        GROUP BY d.targetClass.classId, d.targetClass.className, d.targetClass.packageName
        ORDER BY COUNT(d) DESC
        """)
    List<ClassRankingProjection> findMostDependedUponClasses(@Param("projectId") Long projectId);
}