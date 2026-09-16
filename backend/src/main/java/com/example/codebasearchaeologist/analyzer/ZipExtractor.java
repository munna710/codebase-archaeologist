package com.example.codebasearchaeologist.analyzer;

import com.example.codebasearchaeologist.exception.RepositoryDownloadException;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Component
public class ZipExtractor {

    private static final long MAX_UNCOMPRESSED_SIZE = 200L * 1024 * 1024; // 200 MB safety cap
    private static final int MAX_ENTRIES = 5000; // guards against "zip bomb" style abuse

    public File extractZip(File zipFile, Long projectId) {
        Path tempDir;
        try {
            tempDir = Files.createTempDirectory("zip-" + projectId + "-");
        } catch (IOException e) {
            throw new RepositoryDownloadException("Could not create temporary directory for extraction", e);
        }

        File targetDir = tempDir.toFile();
        long totalSize = 0;
        int entryCount = 0;

        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile))) {
            ZipEntry entry;

            while ((entry = zis.getNextEntry()) != null) {
                entryCount++;
                if (entryCount > MAX_ENTRIES) {
                    throw new RepositoryDownloadException(
                            "ZIP file contains too many entries (limit: " + MAX_ENTRIES + ").");
                }

                File outputFile = resolveSafely(targetDir, entry.getName());

                if (entry.isDirectory()) {
                    outputFile.mkdirs();
                    continue;
                }

                outputFile.getParentFile().mkdirs();

                try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                    byte[] buffer = new byte[8192];
                    int bytesRead;
                    while ((bytesRead = zis.read(buffer)) != -1) {
                        totalSize += bytesRead;
                        if (totalSize > MAX_UNCOMPRESSED_SIZE) {
                            throw new RepositoryDownloadException(
                                    "ZIP file is too large when extracted (limit: 200 MB).");
                        }
                        fos.write(buffer, 0, bytesRead);
                    }
                }
            }

        } catch (IOException e) {
            throw new RepositoryDownloadException("Failed to extract ZIP file: " + e.getMessage(), e);
        }

        return targetDir;
    }

    /**
     * Resolves a ZIP entry's path against the target extraction directory,
     * rejecting any entry that would escape outside it (the "zip slip" attack:
     * an entry named e.g. "../../etc/passwd" trying to write outside the
     * intended folder). This check is mandatory whenever extracting untrusted
     * ZIP files, regardless of who uploaded them.
     */
    private File resolveSafely(File targetDir, String entryName) {
        File resolved = new File(targetDir, entryName);

        String targetDirPath = targetDir.getAbsolutePath();
        String resolvedPath = resolved.getAbsolutePath();

        if (!resolvedPath.startsWith(targetDirPath + File.separator) && !resolvedPath.equals(targetDirPath)) {
            throw new RepositoryDownloadException(
                    "ZIP file contains an unsafe entry path: " + entryName);
        }

        return resolved;
    }
}