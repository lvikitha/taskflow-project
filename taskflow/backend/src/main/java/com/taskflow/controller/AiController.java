package com.taskflow.controller;

import com.taskflow.dto.TaskFlowDTOs.*;
import com.taskflow.entity.Task;
import com.taskflow.service.AiService;
import com.taskflow.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI Controller — endpoints for AI-powered features using Google Gemini.
 * All routes require a valid JWT Bearer token.
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "AI-powered task automation endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AiController {

    private final AiService aiService;
    private final TaskService taskService;

    @PostMapping("/generate-task")
    @Operation(
        summary = "AI Task Description Generator",
        description = "Provide a task title and receive AI-generated description, priority, and time estimate"
    )
    public ResponseEntity<ApiResponse<AiGeneratedTask>> generateTaskDetails(
            @Valid @RequestBody AiGenerateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AiGeneratedTask result = aiService.generateTaskDetails(request.getTitle());
        return ResponseEntity.ok(ApiResponse.success("AI task details generated", result));
    }

    @GetMapping("/summary")
    @Operation(
        summary = "AI Productivity Summary",
        description = "Get an AI-generated summary of your tasks with productivity insights"
    )
    public ResponseEntity<ApiResponse<AiSummaryResponse>> getProductivitySummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Task> tasks = taskService.getRawTasksForUser(userDetails.getUsername());
        AiSummaryResponse summary = aiService.generateProductivitySummary(tasks);
        return ResponseEntity.ok(ApiResponse.success("Productivity summary generated", summary));
    }
}
