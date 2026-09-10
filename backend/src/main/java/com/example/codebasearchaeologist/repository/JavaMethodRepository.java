package com.example.codebasearchaeologist.repository;

import com.example.codebasearchaeologist.entity.JavaMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JavaMethodRepository extends JpaRepository<JavaMethod, Long> {
    List<JavaMethod> findByJavaClass_ClassId(Long classId);
}