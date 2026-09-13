package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.dto.CodeSmellDto;
import com.example.codebasearchaeologist.entity.JavaClass;
import com.example.codebasearchaeologist.entity.JavaMethod;
import com.example.codebasearchaeologist.repository.DependencyRepository;
import com.example.codebasearchaeologist.repository.JavaClassRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.example.codebasearchaeologist.analyzer.CodeSmellThresholds.*;

@Service
public class CodeSmellService {

    private final JavaClassRepository javaClassRepository;
    private final DependencyRepository dependencyRepository;

    public CodeSmellService(JavaClassRepository javaClassRepository,
                             DependencyRepository dependencyRepository) {
        this.javaClassRepository = javaClassRepository;
        this.dependencyRepository = dependencyRepository;
    }

    public List<CodeSmellDto> detectSmells(Long projectId) {
        List<CodeSmellDto> smells = new ArrayList<>();
        List<JavaClass> classes = javaClassRepository.findByJavaFile_Project_ProjectId(projectId);

        for (JavaClass javaClass : classes) {
            smells.addAll(checkGodClass(javaClass));
            smells.addAll(checkLongParameterLists(javaClass));
            smells.addAll(checkHighCoupling(javaClass));
            smells.addAll(checkHubClass(javaClass));
        }

        return smells;
    }

    private List<CodeSmellDto> checkGodClass(JavaClass javaClass) {
        int methodCount = javaClass.getMethods().size();

        if (methodCount >= GOD_CLASS_METHOD_COUNT) {
            String severity = methodCount >= GOD_CLASS_METHOD_COUNT * 2 ? "HIGH" : "MEDIUM";
            String description = "This class has " + methodCount + " methods, which is unusually high "
                    + "(threshold: " + GOD_CLASS_METHOD_COUNT + "). It may be doing too much and could "
                    + "benefit from being split into smaller, more focused classes.";

            return List.of(new CodeSmellDto(
                    javaClass.getClassId(), javaClass.getClassName(), "GOD_CLASS", description, severity));
        }
        return List.of();
    }

    private List<CodeSmellDto> checkLongParameterLists(JavaClass javaClass) {
        List<CodeSmellDto> results = new ArrayList<>();

        for (JavaMethod method : javaClass.getMethods()) {
            if (method.getParameters() == null || method.getParameters().isBlank()) continue;

            int paramCount = method.getParameters().split(",").length;

            if (paramCount >= LONG_PARAMETER_LIST_COUNT) {
                String severity = paramCount >= LONG_PARAMETER_LIST_COUNT + 3 ? "HIGH" : "MEDIUM";
                String description = "Method '" + method.getMethodName() + "' takes " + paramCount
                        + " parameters, which is hard to call correctly and often signals the method "
                        + "is doing too many things or should accept an object instead of many primitives.";

                results.add(new CodeSmellDto(
                        javaClass.getClassId(), javaClass.getClassName(), "LONG_PARAMETER_LIST", description, severity));
            }
        }
        return results;
    }

    private List<CodeSmellDto> checkHighCoupling(JavaClass javaClass) {
        long outgoingCount = dependencyRepository.findBySourceClass_ClassId(javaClass.getClassId()).size();

        if (outgoingCount >= HIGH_COUPLING_DEPENDENCY_COUNT) {
            String severity = outgoingCount >= HIGH_COUPLING_DEPENDENCY_COUNT * 1.5 ? "HIGH" : "MEDIUM";
            String description = "This class depends on " + outgoingCount + " other classes, which is "
                    + "unusually high (threshold: " + HIGH_COUPLING_DEPENDENCY_COUNT + "). Changes elsewhere "
                    + "in the codebase are more likely to require changes here too.";

            return List.of(new CodeSmellDto(
                    javaClass.getClassId(), javaClass.getClassName(), "HIGH_COUPLING", description, severity));
        }
        return List.of();
    }

    private List<CodeSmellDto> checkHubClass(JavaClass javaClass) {
        long incomingCount = dependencyRepository.findByTargetClass_ClassId(javaClass.getClassId()).size();

        if (incomingCount >= HUB_CLASS_DEPENDENT_COUNT) {
            String severity = incomingCount >= HUB_CLASS_DEPENDENT_COUNT * 1.5 ? "HIGH" : "MEDIUM";
            String description = incomingCount + " other classes depend on this one (threshold: "
                    + HUB_CLASS_DEPENDENT_COUNT + "). It's a central piece of the architecture — "
                    + "changing its behavior or interface carries higher risk of breaking other code.";

            return List.of(new CodeSmellDto(
                    javaClass.getClassId(), javaClass.getClassName(), "HUB_CLASS", description, severity));
        }
        return List.of();
    }
}