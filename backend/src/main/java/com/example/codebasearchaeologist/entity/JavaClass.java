package com.example.codebasearchaeologist.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classes")
public class JavaClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long classId;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "file_id", nullable = false)
    private JavaFile javaFile;

    @Column(nullable = false)
    private String className;

    private String packageName;

    @Enumerated(EnumType.STRING)
    private ClassType classType;

    @OneToMany(mappedBy = "javaClass", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JavaMethod> methods = new ArrayList<>();

    public JavaClass() {
    }

    // Getters and setters

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public JavaFile getJavaFile() { return javaFile; }
    public void setJavaFile(JavaFile javaFile) { this.javaFile = javaFile; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getPackageName() { return packageName; }
    public void setPackageName(String packageName) { this.packageName = packageName; }

    public ClassType getClassType() { return classType; }
    public void setClassType(ClassType classType) { this.classType = classType; }

    public List<JavaMethod> getMethods() { return methods; }
    public void setMethods(List<JavaMethod> methods) { this.methods = methods; }
}