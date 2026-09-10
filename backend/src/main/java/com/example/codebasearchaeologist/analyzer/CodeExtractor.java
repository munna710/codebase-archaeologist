package com.example.codebasearchaeologist.analyzer;

import com.example.codebasearchaeologist.entity.*;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.Parameter;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.stream.Collectors;

@Component
public class CodeExtractor {

    /**
     * Builds a JavaFile entity (without classes yet) from a parsed AST + its
     * source file on disk. Does not persist anything — that's the caller's job.
     */
    public JavaFile extractFile(CompilationUnit cu, File sourceFile, Project project) {
        JavaFile javaFile = new JavaFile();
        javaFile.setProject(project);
        javaFile.setFileName(sourceFile.getName());
        javaFile.setFilePath(sourceFile.getAbsolutePath());
        javaFile.setLanguage("Java");

        String packageName = cu.getPackageDeclaration()
                .map(pd -> pd.getNameAsString())
                .orElse("(default package)");

        // Extract regular classes and interfaces
        cu.findAll(ClassOrInterfaceDeclaration.class).forEach(decl -> {
            // Skip nested classes for now — only top-level declarations.
            if (!isTopLevel(decl)) return;

            JavaClass javaClass = new JavaClass();
            javaClass.setJavaFile(javaFile);
            javaClass.setClassName(decl.getNameAsString());
            javaClass.setPackageName(packageName);

            if (decl.isInterface()) {
                javaClass.setClassType(ClassType.INTERFACE);
            } else if (decl.isAbstract()) {
                javaClass.setClassType(ClassType.ABSTRACT_CLASS);
            } else {
                javaClass.setClassType(ClassType.CLASS);
            }

            extractMethods(decl.getMethods(), javaClass);

            javaFile.getClasses().add(javaClass);
        });

        // Extract enums separately (JavaParser models them as a different AST node type)
        cu.findAll(EnumDeclaration.class).forEach(decl -> {
            if (!isTopLevel(decl)) return;

            JavaClass javaClass = new JavaClass();
            javaClass.setJavaFile(javaFile);
            javaClass.setClassName(decl.getNameAsString());
            javaClass.setPackageName(packageName);
            javaClass.setClassType(ClassType.ENUM);

            extractMethods(decl.getMethods(), javaClass);

            javaFile.getClasses().add(javaClass);
        });

        return javaFile;
    }

    private void extractMethods(java.util.List<MethodDeclaration> methodDeclarations, JavaClass javaClass) {
        for (MethodDeclaration methodDecl : methodDeclarations) {
            JavaMethod method = new JavaMethod();
            method.setJavaClass(javaClass);
            method.setMethodName(methodDecl.getNameAsString());
            method.setReturnType(methodDecl.getType().asString());

            String params = methodDecl.getParameters().stream()
                    .map(p -> p.getType().asString() + " " + p.getNameAsString())
                    .collect(Collectors.joining(", "));
            method.setParameters(params);

            javaClass.getMethods().add(method);
        }
    }

    private boolean isTopLevel(com.github.javaparser.ast.Node node) {
        // A declaration is top-level if its direct parent is the CompilationUnit itself,
        // not another class (which would make it a nested/inner class).
        return node.getParentNode()
                .map(parent -> parent instanceof CompilationUnit)
                .orElse(false);
    }
}