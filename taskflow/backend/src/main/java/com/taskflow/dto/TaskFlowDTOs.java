package com.taskflow.dto;

import com.taskflow.entity.Task;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Objects (DTOs) for API request/response.
 * Separates the API contract from internal entity structure.
 */
public class TaskFlowDTOs {

    // ─────────────────── AUTH DTOs ───────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 50, message = "Password must be between 6 and 50 characters")
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String tokenType;
        private Long userId;
        private String fullName;
        private String email;
        private String role;
    }

    // ─────────────────── TASK DTOs ───────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTaskRequest {
        @NotBlank(message = "Task title is required")
        @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
        private String title;

        private String description;

        private Task.Priority priority;

        private Task.Status status;

        @Future(message = "Due date must be in the future")
        private LocalDate dueDate;

        private String estimatedEffort;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateTaskRequest {
        @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
        private String title;

        private String description;

        private Task.Priority priority;

        private Task.Status status;

        private LocalDate dueDate;

        private String estimatedEffort;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskResponse {
        private Long id;
        private String title;
        private String description;
        private Task.Priority priority;
        private Task.Status status;
        private LocalDate dueDate;
        private String estimatedEffort;
        private String taskHash;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Long userId;
        private boolean isOverdue;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskStatsResponse {
        private long totalTasks;
        private long todoCount;
        private long inProgressCount;
        private long doneCount;
        private long overdueCount;
        private long dueSoonCount;
    }

    // ─────────────────── AI DTOs ───────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiGenerateRequest {
        @NotBlank(message = "Task title is required for AI generation")
        private String title;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiGeneratedTask {
        private String description;
        private String priority;
        private String estimatedEffort;
        private String reasoning;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiSummaryResponse {
        private String summary;
        private String productivityInsight;
        private java.util.List<String> recommendations;
        private long totalTasks;
        private long completedToday;
        private long pendingHighPriority;
    }

    // ─────────────────── GENERIC RESPONSE ───────────────────

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message(message)
                    .data(data)
                    .build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder()
                    .success(false)
                    .message(message)
                    .build();
        }
    }
}
