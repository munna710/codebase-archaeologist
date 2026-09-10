package com.example.codebasearchaeologist.repository;

import com.example.codebasearchaeologist.entity.JavaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JavaFileRepository extends JpaRepository<JavaFile, Long> {
    List<JavaFile> findByProject_ProjectId(Long projectId);
}