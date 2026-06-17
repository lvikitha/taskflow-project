package com.taskflow.controller;

import com.taskflow.dto.TaskFlowDTOs.*;
import com.taskflow.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Task Controller — protected CRUD endpoints for task management.
 * All routes require a valid JWT Bearer token.
 */
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.createTask(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", task));
    }

    @GetMapping
    @Operation(summary = "Get all tasks with pagination")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Page<TaskResponse> tasks = taskService.getAllTasks(userDetails.getUsername(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Tasks fetched successfully", tasks));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific task by ID")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.getTaskById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task fetched successfully", task));
    }

    @GetMapping("/search")
    @Operation(summary = "Search tasks by keyword in title or description")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> searchTasks(
            @RequestParam String keyword,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TaskResponse> tasks = taskService.searchTasks(keyword, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Search results", tasks));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get task statistics for the dashboard")
    public ResponseEntity<ApiResponse<TaskStatsResponse>> getTaskStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskStatsResponse stats = taskService.getTaskStats(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Stats fetched successfully", stats));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a task (full update)")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TaskResponse task = taskService.updateTask(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", task));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Quick-update task status only")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        UpdateTaskRequest request = new UpdateTaskRequest();
        request.setStatus(com.taskflow.entity.Task.Status.valueOf(status.toUpperCase()));
        TaskResponse task = taskService.updateTask(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task status updated", task));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}
