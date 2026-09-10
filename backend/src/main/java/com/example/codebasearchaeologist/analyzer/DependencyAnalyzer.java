package com.example.codebasearchaeologist.analyzer;

import com.example.codebasearchaeologist.entity.Dependency;
import com.example.codebasearchaeologist.entity.DependencyType;
import com.example.codebasearchaeologist.entity.JavaClass;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.type.ClassOrInterfaceType;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DependencyAnalyzer {

    /**
     * Given all parsed CompilationUnits for a project (paired with their saved
     * JavaClass entities), finds dependencies between classes based on:
     * field types, method parameter/return types, and extends/implements.
     *
     * classesByName lets us look up a JavaClass entity (already saved, with an ID)
     * by its simple class name, so we can link dependencies to real database rows.
     */
    public List<Dependency> analyzeDependencies(
            Map<String, JavaClass> classesByName,
            Map<JavaClass, ClassOrInterfaceDeclaration> declarationsByClass) {

        List<Dependency> dependencies = new ArrayList<>();
        Set<String> seenPairs = new HashSet<>(); // avoid duplicate (source, target, type) rows

        for (Map.Entry<JavaClass, ClassOrInterfaceDeclaration> entry : declarationsByClass.entrySet()) {
            JavaClass sourceClass = entry.getKey();
            ClassOrInterfaceDeclaration decl = entry.getValue();

            // 1. Extends / Implements
            decl.getExtendedTypes().forEach(extendedType ->
                    tryAddDependency(dependencies, seenPairs, classesByName, sourceClass,
                            extendedType.getNameAsString(), DependencyType.EXTENDS));

            decl.getImplementedTypes().forEach(implementedType ->
                    tryAddDependency(dependencies, seenPairs, classesByName, sourceClass,
                            implementedType.getNameAsString(), DependencyType.IMPLEMENTS));

            // 2. Field types
            decl.findAll(FieldDeclaration.class).forEach(field -> {
                String typeName = extractSimpleTypeName(field.getElementType().asString());
                tryAddDependency(dependencies, seenPairs, classesByName, sourceClass,
                        typeName, DependencyType.USES);
            });

            // 3. Method parameter and return types
            decl.findAll(MethodDeclaration.class).forEach(method -> {
                String returnTypeName = extractSimpleTypeName(method.getType().asString());
                tryAddDependency(dependencies, seenPairs, classesByName, sourceClass,
                        returnTypeName, DependencyType.USES);

                method.getParameters().forEach(param -> {
                    String paramTypeName = extractSimpleTypeName(param.getType().asString());
                    tryAddDependency(dependencies, seenPairs, classesByName, sourceClass,
                            paramTypeName, DependencyType.USES);
                });
            });
        }

        return dependencies;
    }

    private void tryAddDependency(List<Dependency> dependencies, Set<String> seenPairs,
                                    Map<String, JavaClass> classesByName, JavaClass sourceClass,
                                    String targetTypeName, DependencyType type) {

        JavaClass targetClass = classesByName.get(targetTypeName);

        if (targetClass == null) return;                          // type not part of this project (e.g. String, List)
        if (targetClass.getClassId().equals(sourceClass.getClassId())) return; // skip self-dependency

        String pairKey = sourceClass.getClassId() + "->" + targetClass.getClassId() + ":" + type;
        if (seenPairs.contains(pairKey)) return;                  // skip duplicates

        seenPairs.add(pairKey);
        dependencies.add(new Dependency(sourceClass, targetClass, type));
    }

    /**
     * Strips generic parameters and array brackets so "List<PaymentGateway>"
     * becomes "List", and we separately handle unwrapping generics below.
     * For simplicity, this also tries to pull out the generic inner type,
     * since "List<PaymentGateway>" should really point at PaymentGateway.
     */
    private String extractSimpleTypeName(String rawType) {
        String type = rawType.replace("[]", "").trim();

        if (type.contains("<")) {
            // e.g. "List<PaymentGateway>" -> "PaymentGateway"
            int start = type.indexOf('<') + 1;
            int end = type.lastIndexOf('>');
            if (end > start) {
                String inner = type.substring(start, end);
                // handle nested generics like Map<String, PaymentGateway> by taking the last type
                String[] innerParts = inner.split(",");
                return innerParts[innerParts.length - 1].trim();
            }
        }

        return type;
    }
}