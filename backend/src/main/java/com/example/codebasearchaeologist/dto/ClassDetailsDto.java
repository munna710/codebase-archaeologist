package com.example.codebasearchaeologist.dto;

import com.example.codebasearchaeologist.entity.ClassType;
import java.util.List;

public class ClassDetailsDto {

    private Long classId;
    private String className;
    private String packageName;
    private ClassType classType;
    private String fileName;

    private List<MethodDto> methods;
    private List<DependencyRefDto> outgoingDependencies;
    private List<DependencyRefDto> incomingDependencies;

    private String aiExplanation; // null if not generated yet

    public ClassDetailsDto(Long classId, String className, String packageName, ClassType classType,
                            String fileName, List<MethodDto> methods,
                            List<DependencyRefDto> outgoingDependencies,
                            List<DependencyRefDto> incomingDependencies,
                            String aiExplanation) {
        this.classId = classId;
        this.className = className;
        this.packageName = packageName;
        this.classType = classType;
        this.fileName = fileName;
        this.methods = methods;
        this.outgoingDependencies = outgoingDependencies;
        this.incomingDependencies = incomingDependencies;
        this.aiExplanation = aiExplanation;
    }

    public Long getClassId() { return classId; }
    public String getClassName() { return className; }
    public String getPackageName() { return packageName; }
    public ClassType getClassType() { return classType; }
    public String getFileName() { return fileName; }
    public List<MethodDto> getMethods() { return methods; }
    public List<DependencyRefDto> getOutgoingDependencies() { return outgoingDependencies; }
    public List<DependencyRefDto> getIncomingDependencies() { return incomingDependencies; }
    public String getAiExplanation() { return aiExplanation; }

    public static class MethodDto {
        private String methodName;
        private String returnType;
        private String parameters;

        public MethodDto(String methodName, String returnType, String parameters) {
            this.methodName = methodName;
            this.returnType = returnType;
            this.parameters = parameters;
        }

        public String getMethodName() { return methodName; }
        public String getReturnType() { return returnType; }
        public String getParameters() { return parameters; }
    }

    public static class DependencyRefDto {
        private Long classId;
        private String className;
        private String dependencyType;

        public DependencyRefDto(Long classId, String className, String dependencyType) {
            this.classId = classId;
            this.className = className;
            this.dependencyType = dependencyType;
        }

        public Long getClassId() { return classId; }
        public String getClassName() { return className; }
        public String getDependencyType() { return dependencyType; }
    }
}