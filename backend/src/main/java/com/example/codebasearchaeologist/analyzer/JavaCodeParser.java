package com.example.codebasearchaeologist.analyzer;

import com.github.javaparser.JavaParser;
import com.github.javaparser.ParseResult;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.symbolsolver.JavaSymbolSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.JavaParserTypeSolver;
import com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Optional;

@Component
public class JavaCodeParser {

    /**
     * Builds a JavaParser instance configured with a symbol solver, so it can
     * resolve types (e.g. know "PaymentRepository" refers to a specific class)
     * by looking both at the JDK's own classes and at source files in the repo.
     */
    public JavaParser buildParser(File sourceRoot) {
        CombinedTypeSolver typeSolver = new CombinedTypeSolver();
        typeSolver.add(new ReflectionTypeSolver());            // resolves JDK classes (String, List, etc.)
        typeSolver.add(new JavaParserTypeSolver(sourceRoot));   // resolves classes within this repo

        JavaSymbolSolver symbolSolver = new JavaSymbolSolver(typeSolver);

        JavaParser javaParser = new JavaParser();
        javaParser.getParserConfiguration().setSymbolResolver(symbolSolver);
        return javaParser;
    }

    public Optional<CompilationUnit> parseFile(JavaParser javaParser, File javaFile) {
        try {
            ParseResult<CompilationUnit> result = javaParser.parse(javaFile);

            if (!result.isSuccessful() || result.getResult().isEmpty()) {
                System.err.println("Failed to parse: " + javaFile.getPath()
                        + " -> " + result.getProblems());
                return Optional.empty();
            }

            return result.getResult();

        } catch (FileNotFoundException e) {
            System.err.println("File not found: " + javaFile.getPath());
            return Optional.empty();
        }
    }
}