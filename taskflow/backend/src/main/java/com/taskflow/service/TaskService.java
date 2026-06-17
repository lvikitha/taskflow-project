package com.taskflow.service;

import com.taskflow.dto.TaskFlowDTOs.*;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.exception.UnauthorizedAccessException;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core Task Service — handles all CRUD operations plus stats.
 * Each mutating operation generates a fresh blockchain hash.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskBlockchainService blockchainService;

    // ─────────────────── CREATE ───────────────────

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : Task.Status.TODO)
                .dueDate(request.getDueDate())
                .estimatedEffort(request.getEstimatedEffort())
                .user(user)
                .build();

        task = taskRepository.save(task);

        // Generate blockchain hash after save (we now have an ID)
        task.setTaskHash(blockchainService.generateTaskHash(task));
        task = taskRepository.save(task);

        log.info("Task created [id={}] by user [{}]", task.getId(), userEmail);
        return mapToResponse(task);
    }

    // ─────────────────── READ ───────────────────

    @Transactional(readOnly = true)
    public Page<TaskResponse> getAllTasks(String userEmail, int page, int size) {
        User user = getUserByEmail(userEmail);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        return mapToResponse(task);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> searchTasks(String keyword, String userEmail) {
        User user = getUserByEmail(userEmail);
        return taskRepository.searchByKeyword(user.getId(), keyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse getTaskStats(String userEmail) {
        User user = getUserByEmail(userEmail);
        Long userId = user.getId();
        LocalDate today = LocalDate.now();

        return TaskStatsResponse.builder()
                .totalTasks(taskRepository.countByUserIdAndStatus(userId, Task.Status.TODO)
                        + taskRepository.countByUserIdAndStatus(userId, Task.Status.IN_PROGRESS)
                        + taskRepository.countByUserIdAndStatus(userId, Task.Status.DONE))
                .todoCount(taskRepository.countByUserIdAndStatus(userId, Task.Status.TODO))
                .inProgressCount(taskRepository.countByUserIdAndStatus(userId, Task.Status.IN_PROGRESS))
                .doneCount(taskRepository.countByUserIdAndStatus(userId, Task.Status.DONE))
                .overdueCount(taskRepository.findOverdueTasks(userId, today).size())
                .dueSoonCount(taskRepository.findTasksDueSoon(userId, today, today.plusDays(3)).size())
                .build();
    }

    // ─────────────────── UPDATE ───────────────────

    @Transactional
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        // Partial update — only set fields that are provided
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getEstimatedEffort() != null) task.setEstimatedEffort(request.getEstimatedEffort());

        // Regenerate blockchain hash to reflect updated state
        task.setTaskHash(blockchainService.generateTaskHash(task));
        task = taskRepository.save(task);

        log.info("Task updated [id={}] by user [{}]", task.getId(), userEmail);
        return mapToResponse(task);
    }

    // ─────────────────── DELETE ───────────────────

    @Transactional
    public void deleteTask(Long taskId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Task task = taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        taskRepository.delete(task);
        log.info("Task deleted [id={}] by user [{}]", taskId, userEmail);
    }

    // ─────────────────── PRIVATE HELPERS ───────────────────

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public TaskResponse mapToResponse(Task task) {
        boolean isOverdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != Task.Status.DONE;

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .estimatedEffort(task.getEstimatedEffort())
                .taskHash(task.getTaskHash())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .userId(task.getUser().getId())
                .isOverdue(isOverdue)
                .build();
    }

    // Used by AI service
    public List<Task> getRawTasksForUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        return taskRepository.findByUserId(user.getId());
    }
}
