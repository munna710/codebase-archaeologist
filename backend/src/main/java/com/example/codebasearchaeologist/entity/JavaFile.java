package com.example.codebasearchaeologist.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "files")
public class JavaFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String language = "Java";

    @Column(columnDefinition = "TEXT")
    private String summary;

    @OneToMany(mappedBy = "javaFile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JavaClass> classes = new ArrayList<>();

    public JavaFile() {
    }

    // Getters and setters

    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<JavaClass> getClasses() { return classes; }
    public void setClasses(List<JavaClass> classes) { this.classes = classes; }
}