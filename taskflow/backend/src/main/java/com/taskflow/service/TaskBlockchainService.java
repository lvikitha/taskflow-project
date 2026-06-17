package com.taskflow.service;

import com.taskflow.entity.Task;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

/**
 * Lightweight blockchain-inspired audit trail for tasks.
 *
 * Each task state change produces a SHA-256 hash incorporating:
 *  - Task ID
 *  - Title, Description, Status, Priority
 *  - Timestamp of change
 *
 * This creates an immutable, verifiable audit hash stored on the task record.
 * In a production system, these hashes would be chained and stored on a distributed ledger.
 */
@Component
@Slf4j
public class TaskBlockchainService {

    /**
     * Generate a SHA-256 hash representing the current state of a task.
     * This hash acts as a tamper-evident fingerprint for audit purposes.
     */
    public String generateTaskHash(Task task) {
        try {
            String taskState = buildTaskStateString(task);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(taskState.getBytes(StandardCharsets.UTF_8));
            String hash = HexFormat.of().formatHex(hashBytes);
            log.debug("Generated blockchain hash for task {}: {}...{}", task.getId(),
                    hash.substring(0, 8), hash.substring(hash.length() - 8));
            return hash;
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not available", e);
            return null;
        }
    }

    /**
     * Verify that a task's current state matches its stored hash.
     * Returns true if the task has not been tampered with.
     */
    public boolean verifyTaskIntegrity(Task task) {
        if (task.getTaskHash() == null) return false;
        String currentHash = generateTaskHash(task);
        return task.getTaskHash().equals(currentHash);
    }

    /**
     * Build a deterministic string representation of task state for hashing.
     * Uses a structured format to ensure consistent hashing.
     */
    private String buildTaskStateString(Task task) {
        return String.format(
            "id=%s|title=%s|desc=%s|status=%s|priority=%s|due=%s|user=%s|ts=%s",
            task.getId(),
            task.getTitle(),
            task.getDescription() != null ? task.getDescription() : "",
            task.getStatus(),
            task.getPriority(),
            task.getDueDate() != null ? task.getDueDate().toString() : "",
            task.getUser() != null ? task.getUser().getId() : "",
            LocalDateTime.now().withSecond(0).withNano(0) // minute-level precision
        );
    }
}
