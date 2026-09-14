package com.example.codebasearchaeologist.repository;

import com.example.codebasearchaeologist.entity.Documentation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentationRepository extends JpaRepository<Documentation, Long> {
    List<Documentation> findByProject_ProjectId(Long projectId);
    Optional<Documentation> findByJavaClass_ClassId(Long classId);

    @Query(value = """
        SELECT d.class_id AS classId, d.content AS content,
               (d.embedding <=> CAST(:queryEmbedding AS vector)) AS distance
        FROM documentation d
        WHERE d.project_id = :projectId AND d.embedding IS NOT NULL
        ORDER BY distance ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<SemanticSearchResult> findSimilarDocumentation(
            @Param("projectId") Long projectId,
            @Param("queryEmbedding") String queryEmbedding,
            @Param("limit") int limit);
}