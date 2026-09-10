package com.example.codebasearchaeologist.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "dependencies")
public class Dependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dependencyId;

    @ManyToOne
    @JoinColumn(name = "source_class_id", nullable = false)
    private JavaClass sourceClass;

    @ManyToOne
    @JoinColumn(name = "target_class_id", nullable = false)
    private JavaClass targetClass;

    @Enumerated(EnumType.STRING)
    private DependencyType dependencyType;

    public Dependency() {
    }

    public Dependency(JavaClass sourceClass, JavaClass targetClass, DependencyType dependencyType) {
        this.sourceClass = sourceClass;
        this.targetClass = targetClass;
        this.dependencyType = dependencyType;
    }

    // Getters and setters

    public Long getDependencyId() { return dependencyId; }
    public void setDependencyId(Long dependencyId) { this.dependencyId = dependencyId; }

    public JavaClass getSourceClass() { return sourceClass; }
    public void setSourceClass(JavaClass sourceClass) { this.sourceClass = sourceClass; }

    public JavaClass getTargetClass() { return targetClass; }
    public void setTargetClass(JavaClass targetClass) { this.targetClass = targetClass; }

    public DependencyType getDependencyType() { return dependencyType; }
    public void setDependencyType(DependencyType dependencyType) { this.dependencyType = dependencyType; }
}