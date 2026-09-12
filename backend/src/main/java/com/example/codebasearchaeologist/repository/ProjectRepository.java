package com.example.codebasearchaeologist.repository;

import com.example.codebasearchaeologist.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

//    boolean existsByRepositoryUrl(String repositoryUrl);
    Optional<Project> findByRepositoryUrl(String repositoryUrl);
}