package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.dto.ClassDetailsDto;
import com.example.codebasearchaeologist.entity.Dependency;
import com.example.codebasearchaeologist.entity.JavaClass;
import com.example.codebasearchaeologist.exception.ProjectNotFoundException;
import com.example.codebasearchaeologist.repository.DependencyRepository;
import com.example.codebasearchaeologist.repository.DocumentationRepository;
import com.example.codebasearchaeologist.repository.JavaClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassDetailsService {

    private final JavaClassRepository javaClassRepository;
    private final DependencyRepository dependencyRepository;
    private final DocumentationRepository documentationRepository;

    public ClassDetailsService(JavaClassRepository javaClassRepository,
                                DependencyRepository dependencyRepository,
                                DocumentationRepository documentationRepository) {
        this.javaClassRepository = javaClassRepository;
        this.dependencyRepository = dependencyRepository;
        this.documentationRepository = documentationRepository;
    }

    public ClassDetailsDto getClassDetails(Long classId) {
        JavaClass javaClass = javaClassRepository.findById(classId)
                .orElseThrow(() -> new ClassNotFoundException(classId)); // reused for simplicity; see note below

        List<ClassDetailsDto.MethodDto> methods = javaClass.getMethods().stream()
                .map(m -> new ClassDetailsDto.MethodDto(m.getMethodName(), m.getReturnType(), m.getParameters()))
                .toList();

        List<Dependency> outgoing = dependencyRepository.findBySourceClass_ClassId(classId);
        List<ClassDetailsDto.DependencyRefDto> outgoingDtos = outgoing.stream()
                .map(d -> new ClassDetailsDto.DependencyRefDto(
                        d.getTargetClass().getClassId(),
                        d.getTargetClass().getClassName(),
                        d.getDependencyType().toString()))
                .toList();

        List<Dependency> incoming = dependencyRepository.findByTargetClass_ClassId(classId);
        List<ClassDetailsDto.DependencyRefDto> incomingDtos = incoming.stream()
                .map(d -> new ClassDetailsDto.DependencyRefDto(
                        d.getSourceClass().getClassId(),
                        d.getSourceClass().getClassName(),
                        d.getDependencyType().toString()))
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
}