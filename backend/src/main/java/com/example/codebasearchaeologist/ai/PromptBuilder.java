package com.example.codebasearchaeologist.ai;

import com.example.codebasearchaeologist.entity.Dependency;
import com.example.codebasearchaeologist.entity.JavaClass;
import com.example.codebasearchaeologist.entity.JavaMethod;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PromptBuilder {

    public String buildSystemPrompt() {
        return "You are a senior software engineer helping a developer understand an " +
                "unfamiliar Java codebase. Given structured information about a class " +
                "(its methods, dependencies, and source code), explain clearly and concisely: " +
                "1) the class's overall purpose, 2) what each method does, 3) its key " +
                "responsibilities, 4) why it depends on the classes it depends on, and " +
                "5) any likely business logic it implements. Keep the explanation practical " +
                "and easy for a developer new to this codebase to understand. Avoid restating " +
                "the code verbatim; explain its intent.";
    }

    public String buildClassExplanationPrompt(JavaClass javaClass, List<Dependency> outgoingDependencies,
                                                String sourceCodeSnippet) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("Class: ").append(javaClass.getClassName()).append("\n");
        prompt.append("Package: ").append(javaClass.getPackageName()).append("\n");
        prompt.append("Type: ").append(javaClass.getClassType()).append("\n\n");

        prompt.append("Methods:\n");
        List<JavaMethod> methods = javaClass.getMethods();
        if (methods.isEmpty()) {
            prompt.append("(none)\n");
        } else {
            for (JavaMethod method : methods) {
                prompt.append("- ").append(method.getReturnType())
                        .append(" ").append(method.getMethodName())
                        .append("(").append(method.getParameters()).append(")\n");
            }
        }

        prompt.append("\nDependencies:\n");
        if (outgoingDependencies.isEmpty()) {
            prompt.append("(none)\n");
        } else {
            String depList = outgoingDependencies.stream()
                    .map(d -> d.getTargetClass().getClassName() + " (" + d.getDependencyType() + ")")
                    .collect(Collectors.joining(", "));
            prompt.append(depList).append("\n");
        }

        prompt.append("\nRelevant source code:\n");
        prompt.append(sourceCodeSnippet);

        return prompt.toString();
    }
}