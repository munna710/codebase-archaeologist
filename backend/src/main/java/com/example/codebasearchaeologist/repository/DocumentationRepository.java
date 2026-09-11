package com.example.codebasearchaeologist.repository;

import com.example.codebasearchaeologist.entity.Documentation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentationRepository extends JpaRepository<Documentation, Long> {
    List<Documentation> findByProject_ProjectId(Long projectId);
    Optional<Documentation> findByJavaClass_ClassId(Long classId);
}