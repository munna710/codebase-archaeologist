package com.example.codebasearchaeologist.repository;

import com.example.codebasearchaeologist.entity.Dependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DependencyRepository extends JpaRepository<Dependency, Long> {
    List<Dependency> findBySourceClass_JavaFile_Project_ProjectId(Long projectId);
}