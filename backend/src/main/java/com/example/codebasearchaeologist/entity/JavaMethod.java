package com.example.codebasearchaeologist.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "methods")
public class JavaMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long methodId;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "class_id", nullable = false)
    private JavaClass javaClass;

    @Column(nullable = false)
    private String methodName;

    private String returnType;

    @Column(columnDefinition = "TEXT")
    private String parameters; // stored as a comma-separated string, e.g. "String name, int age"

    @Column(columnDefinition = "TEXT")
    private String summary;

    public JavaMethod() {
    }

    // Getters and setters

    public Long getMethodId() { return methodId; }
    public void setMethodId(Long methodId) { this.methodId = methodId; }

    public JavaClass getJavaClass() { return javaClass; }
    public void setJavaClass(JavaClass javaClass) { this.javaClass = javaClass; }

    public String getMethodName() { return methodName; }
    public void setMethodName(String methodName) { this.methodName = methodName; }

    public String getReturnType() { return returnType; }
    public void setReturnType(String returnType) { this.returnType = returnType; }

    public String getParameters() { return parameters; }
    public void setParameters(String parameters) { this.parameters = parameters; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}