package com.example.codebasearchaeologist.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentation")
public class Documentation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long documentationId;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Nullable: project-level documentation has no specific class
    @ManyToOne
    @JoinColumn(name = "class_id")
    private JavaClass javaClass;

    // Nullable: class-level documentation has no specific method
    @ManyToOne
    @JoinColumn(name = "method_id")
    private JavaMethod javaMethod;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private LocalDateTime createdAt;

    public Documentation() {
    }

    // Getters and setters

    public Long getDocumentationId() { return documentationId; }
    public void setDocumentationId(Long documentationId) { this.documentationId = documentationId; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public JavaClass getJavaClass() { return javaClass; }
    public void setJavaClass(JavaClass javaClass) { this.javaClass = javaClass; }

    public JavaMethod getJavaMethod() { return javaMethod; }
    public void setJavaMethod(JavaMethod javaMethod) { this.javaMethod = javaMethod; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}