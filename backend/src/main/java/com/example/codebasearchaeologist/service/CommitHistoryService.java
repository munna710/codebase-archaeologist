package com.example.codebasearchaeologist.service;

import com.example.codebasearchaeologist.ai.OpenAiClient;
import com.example.codebasearchaeologist.analyzer.RepositoryDownloader;
import com.example.codebasearchaeologist.dto.*;
import com.example.codebasearchaeologist.entity.JavaClass;
import com.example.codebasearchaeologist.entity.Project;
import com.example.codebasearchaeologist.entity.ProjectSourceType;
import com.example.codebasearchaeologist.exception.CommitHistoryUnavailableException;
import com.example.codebasearchaeologist.exception.ProjectNotFoundException;
import com.example.codebasearchaeologist.repository.JavaClassRepository;
import com.example.codebasearchaeologist.repository.ProjectRepository;
import com.example.codebasearchaeologist.security.ProjectAccessGuard;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.diff.DiffEntry;
import org.eclipse.jgit.diff.DiffFormatter;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectReader;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.CanonicalTreeParser;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CommitHistoryService {

    private static final int HISTORY_DEPTH = 50; // how far back we clone, in commits
    private static final int MAX_COMMITS_RETURNED = 30;
    private static final int MAX_DIFF_FILES = 25;
    private static final int MAX_PATCH_CHARS_PER_FILE = 1200;

    // In-memory cache: projectId -> path to a deep-history clone.
    // Simple and fast for a single running instance; cleared on restart,
    // meaning the first request after a restart re-clones once.
    private final Map<Long, File> historyDirCache = new ConcurrentHashMap<>();

    private final ProjectRepository projectRepository;
    private final RepositoryDownloader repositoryDownloader;
    private final JavaClassRepository javaClassRepository;
    private final OpenAiClient openAiClient;
    private final ProjectAccessGuard projectAccessGuard;

    public CommitHistoryService(ProjectRepository projectRepository,
                                RepositoryDownloader repositoryDownloader,
                                JavaClassRepository javaClassRepository,
                                OpenAiClient openAiClient, ProjectAccessGuard projectAccessGuard) {
        this.projectRepository = projectRepository;
        this.repositoryDownloader = repositoryDownloader;
        this.javaClassRepository = javaClassRepository;
        this.openAiClient = openAiClient;
        this.projectAccessGuard = projectAccessGuard;
    }

    private File getOrCloneHistoryRepo(Project project) {
        if (project.getSourceType() != ProjectSourceType.GITHUB) {
            throw new CommitHistoryUnavailableException(
                    "Commit history is only available for projects imported from GitHub, not ZIP uploads.");
        }

        return historyDirCache.computeIfAbsent(project.getProjectId(), id ->
                repositoryDownloader.cloneRepository(project.getRepositoryUrl(), id, HISTORY_DEPTH)
        );
    }

    public List<CommitDto> listCommits(Long projectId) {
        projectAccessGuard.requireOwnedProject(projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        File repoDir = getOrCloneHistoryRepo(project);

        try (Git git = Git.open(repoDir)) {
            List<CommitDto> commits = new ArrayList<>();

            for (RevCommit commit : git.log().setMaxCount(MAX_COMMITS_RETURNED).call()) {
                String firstLine = commit.getFullMessage().split("\n", 2)[0];

                commits.add(new CommitDto(
                        commit.getName(),
                        commit.getName().substring(0, 7),
                        firstLine,
                        commit.getAuthorIdent().getName(),
                        Instant.ofEpochSecond(commit.getCommitTime())
                                .atZone(ZoneId.systemDefault())
                                .toLocalDateTime()
                ));
            }
            return commits;

        } catch (Exception e) {
            throw new CommitHistoryUnavailableException("Failed to read commit history: " + e.getMessage());
        }
    }

    /**
     * Explains what changed in a single commit, relative to its first parent.
     * This is the common case: "what did this commit actually do?"
     */
    public DiffExplanationDto explainCommit(Long projectId, String commitId) {
        projectAccessGuard.requireOwnedProject(projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(projectId));

        File repoDir = getOrCloneHistoryRepo(project);

        try (Git git = Git.open(repoDir)) {
            Repository repository = git.getRepository();

            try (RevWalk revWalk = new RevWalk(repository)) {
                RevCommit commit = revWalk.parseCommit(repository.resolve(commitId));

                if (commit.getParentCount() == 0) {
                    throw new CommitHistoryUnavailableException(
                            "This is the first commit in the repository and has no parent to compare against.");
                }

                RevCommit parent = revWalk.parseCommit(commit.getParent(0).getId());

                return computeDiff(repository, git, project,
                        parent.getTree().getId(), commit.getTree().getId(),
                        parent.getName().substring(0, 7), commit.getName().substring(0, 7));

            }
        } catch (CommitHistoryUnavailableException e) {
            throw e;
        } catch (Exception e) {
            throw new CommitHistoryUnavailableException("Failed to compute diff: " + e.getMessage());
        }
    }

    private DiffExplanationDto computeDiff(Repository repository, Git git, Project project,
                                             ObjectId oldTreeId, ObjectId newTreeId,
                                             String fromLabel, String toLabel) throws Exception {

        List<JavaClass> allClasses = javaClassRepository.findByJavaFile_Project_ProjectId(project.getProjectId());
        Map<String, JavaClass> classByFileName = new HashMap<>();
        for (JavaClass cls : allClasses) {
            classByFileName.put(cls.getJavaFile().getFileName(), cls);
        }

        try (ObjectReader reader = repository.newObjectReader()) {
            CanonicalTreeParser oldTreeIter = new CanonicalTreeParser();
            oldTreeIter.reset(reader, oldTreeId);
            CanonicalTreeParser newTreeIter = new CanonicalTreeParser();
            newTreeIter.reset(reader, newTreeId);

            List<DiffEntry> diffs = git.diff().setOldTree(oldTreeIter).setNewTree(newTreeIter).call();

            List<ChangedFileDto> changedFiles = new ArrayList<>();
            List<RelevantClassDto> affectedClasses = new ArrayList<>();
            Set<Long> addedClassIds = new HashSet<>();
            StringBuilder patchSummary = new StringBuilder();

            int fileCount = 0;
            for (DiffEntry entry : diffs) {
                if (fileCount >= MAX_DIFF_FILES) {
                    patchSummary.append("(additional files changed but omitted for brevity)\n");
                    break;
                }
                fileCount++;

                String path = entry.getChangeType() == DiffEntry.ChangeType.DELETE
                        ? entry.getOldPath() : entry.getNewPath();

                changedFiles.add(new ChangedFileDto(path, entry.getChangeType().toString()));

                String simpleFileName = path.substring(path.lastIndexOf('/') + 1);
                JavaClass matched = classByFileName.get(simpleFileName);
                if (matched != null && addedClassIds.add(matched.getClassId())) {
                    affectedClasses.add(new RelevantClassDto(
                            matched.getClassId(), matched.getClassName(), matched.getPackageName(), null, 0));
                }

                try (ByteArrayOutputStream out = new ByteArrayOutputStream();
                     DiffFormatter formatter = new DiffFormatter(out)) {
                    formatter.setRepository(repository);
                    formatter.format(entry);
                    String patchText = out.toString(StandardCharsets.UTF_8);
                    if (patchText.length() > MAX_PATCH_CHARS_PER_FILE) {
                        patchText = patchText.substring(0, MAX_PATCH_CHARS_PER_FILE) + "\n... (truncated)";
                    }
                    patchSummary.append("File: ").append(path)
                            .append(" [").append(entry.getChangeType()).append("]\n")
                            .append(patchText).append("\n\n");
                }
            }

            String aiExplanation = generateExplanation(fromLabel, toLabel, patchSummary.toString());

            return new DiffExplanationDto(fromLabel, toLabel, changedFiles, affectedClasses, aiExplanation);
        }
    }

    private String generateExplanation(String from, String to, String patchSummary) {
        if (patchSummary.isBlank()) {
            return "No file changes were found between these commits.";
        }

        String systemPrompt = "You are a senior software engineer summarizing a code change for a "
                + "teammate. Given a git diff between two commits, explain in plain English what "
                + "changed, why it likely changed (infer intent from the code), and which parts of "
                + "the system are affected. Be concise, specific, and reference file or class names "
                + "directly rather than speaking generically.";

        String userPrompt = "Diff from commit " + from + " to " + to + ":\n\n" + patchSummary;

        return openAiClient.generateExplanation(systemPrompt, userPrompt);
    }
}