package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.dto.ClassDetailsDto;
import com.example.codebasearchaeologist.dto.ComplexityRankingDto;
import com.example.codebasearchaeologist.entity.Dependency;
import com.example.codebasearchaeologist.entity.JavaClass;
import com.example.codebasearchaeologist.repository.*;
import com.example.codebasearchaeologist.security.ProjectAccessGuard;
import org.springframework.stereotype.Service;
import com.example.codebasearchaeologist.exception.ClassNotFoundException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ClassDetailsService {

    private final JavaClassRepository javaClassRepository;
    private final DependencyRepository dependencyRepository;
    private final DocumentationRepository documentationRepository;
    private final ProjectAccessGuard projectAccessGuard;

    public ClassDetailsService(JavaClassRepository javaClassRepository,
                               DependencyRepository dependencyRepository,
                               DocumentationRepository documentationRepository,
                               ProjectAccessGuard projectAccessGuard) {
        this.javaClassRepository = javaClassRepository;
        this.dependencyRepository = dependencyRepository;
        this.documentationRepository = documentationRepository;
        this.projectAccessGuard = projectAccessGuard;
    }

    public ClassDetailsDto getClassDetails(Long classId) {
        JavaClass javaClass = javaClassRepository.findById(classId)
                .orElseThrow(() -> new ClassNotFoundException(classId));

        // Verify that the class belongs to a project owned by the current user.
        projectAccessGuard.requireOwnedProject(
                javaClass.getJavaFile().getProject().getProjectId()
        );

        List<ClassDetailsDto.MethodDto> methods = javaClass.getMethods().stream()
                .map(m -> new ClassDetailsDto.MethodDto(
                        m.getMethodName(),
                        m.getReturnType(),
                        m.getParameters()
                ))
                .toList();

        List<Dependency> outgoing = dependencyRepository.findBySourceClass_ClassId(classId);

        List<ClassDetailsDto.DependencyRefDto> outgoingDtos = outgoing.stream()
                .map(d -> new ClassDetailsDto.DependencyRefDto(
                        d.getTargetClass().getClassId(),
                        d.getTargetClass().getClassName(),
                        d.getDependencyType().toString()
                ))
                .toList();

        List<Dependency> incoming = dependencyRepository.findByTargetClass_ClassId(classId);

        List<ClassDetailsDto.DependencyRefDto> incomingDtos = incoming.stream()
                .map(d -> new ClassDetailsDto.DependencyRefDto(
                        d.getSourceClass().getClassId(),
                        d.getSourceClass().getClassName(),
                        d.getDependencyType().toString()
                ))
                .toList();

        String aiExplanation = documentationRepository.findByJavaClass_ClassId(classId)
                .map(doc -> doc.getContent())
                .orElse(null);

        return new ClassDetailsDto(
                javaClass.getClassId(),
                javaClass.getClassName(),
                javaClass.getPackageName(),
                javaClass.getClassType(),
                javaClass.getJavaFile().getFileName(),
                methods,
                outgoingDtos,
                incomingDtos,
                aiExplanation
        );
    }

    public List<ClassRankingProjection> getMostDependedUponClasses(Long projectId) {

        // Verify project ownership before accessing project-specific data.
        projectAccessGuard.requireOwnedProject(projectId);

        return dependencyRepository.findMostDependedUponClasses(projectId);
    }

    public List<ComplexityRankingDto> getMostComplexClasses(Long projectId) {

        // Verify project ownership before accessing project-specific data.
        projectAccessGuard.requireOwnedProject(projectId);

        List<ClassMethodCountProjection> methodCounts =
                javaClassRepository.findMethodCountsByProject(projectId);

        List<ClassRankingProjection> dependencyCounts =
                dependencyRepository.findMostDependedUponClasses(projectId);

        // Build a lookup so we can find each class's dependency count by ID,
        // since the two queries return different shapes and aren't pre-joined.
        Map<Long, Long> dependencyCountByClassId = dependencyCounts.stream()
                .collect(Collectors.toMap(
                        ClassRankingProjection::getClassId,
                        ClassRankingProjection::getDependentCount
                ));

        List<ComplexityRankingDto> results = methodCounts.stream()
                .map(mc -> {
                    long methodCount = mc.getMethodCount();
                    long dependencyCount =
                            dependencyCountByClassId.getOrDefault(mc.getClassId(), 0L);

                    // Simple, explainable weighted score:
                    // methods count fully, dependencies count double.
                    long score = methodCount + (dependencyCount * 2);

                    return new ComplexityRankingDto(
                            mc.getClassId(),
                            mc.getClassName(),
                            mc.getPackageName(),
                            methodCount,
                            dependencyCount,
                            score
                    );
                })
                .sorted((a, b) ->
                        Long.compare(
                                b.getComplexityScore(),
                                a.getComplexityScore()
                        )
                )
                .toList();

        return results;
    }
}