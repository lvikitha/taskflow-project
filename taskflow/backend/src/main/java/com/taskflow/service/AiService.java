package com.taskflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.dto.TaskFlowDTOs.*;
import com.taskflow.entity.Task;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * AI Service integrating Google Gemini API.
 * NOTE: @Value fields cannot be used with @RequiredArgsConstructor (Lombok ignores non-final fields).
 * Using field injection + a single WebClient bean instead of per-request creation.
 */
@Service
@Slf4j
public class AiService {

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.gemini.base-url}")
    private String geminiBaseUrl;

    @Value("${ai.gemini.model}")
    private String geminiModel;

    // Spring Boot auto-configures ObjectMapper — injected here
    private final ObjectMapper objectMapper;

    // Single WebClient instance (not created per-request)
    private WebClient webClient;

    public AiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    // Called after @Value fields are injected by Spring
    @jakarta.annotation.PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .baseUrl(geminiBaseUrl)
                .build();
    }

    public AiGeneratedTask generateTaskDetails(String taskTitle) {
        String prompt = buildTaskGenerationPrompt(taskTitle);
        try {
            String aiResponse = callGeminiApi(prompt);
            return parseTaskGenerationResponse(aiResponse, taskTitle);
        } catch (Exception e) {
            log.error("AI task generation failed for title '{}': {}", taskTitle, e.getMessage());
            return buildFallbackTaskDetails(taskTitle);
        }
    }

    public AiSummaryResponse generateProductivitySummary(List<Task> tasks) {
        if (tasks.isEmpty()) {
            return AiSummaryResponse.builder()
                    .summary("No tasks found. Start by creating your first task!")
                    .productivityInsight("Add tasks to get AI-powered productivity insights.")
                    .recommendations(List.of("Create your first task to begin tracking productivity."))
                    .totalTasks(0)
                    .build();
        }
        String prompt = buildSummaryPrompt(tasks);
        try {
            String aiResponse = callGeminiApi(prompt);
            return parseSummaryResponse(aiResponse, tasks);
        } catch (Exception e) {
            log.error("AI summary generation failed: {}", e.getMessage());
            return buildFallbackSummary(tasks);
        }
    }

    private String callGeminiApi(String prompt) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 1024,
                "responseMimeType", "application/json"
            )
        );

        String response = webClient.post()
                .uri("/models/{model}:generateContent", geminiModel)
                .header("x-goog-api-key", geminiApiKey)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractTextFromGeminiResponse(response);
    }

    private String extractTextFromGeminiResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", rawResponse);
            throw new RuntimeException("Invalid AI response format");
        }
    }

    private String buildTaskGenerationPrompt(String taskTitle) {
        return String.format("""
            You are a productivity assistant. Given this task title, provide structured output.
            Task Title: "%s"
            Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
            {
              "description": "A clear 2-3 sentence description of what this task involves",
              "priority": "HIGH | MEDIUM | LOW | CRITICAL",
              "estimatedEffort": "X hours",
              "reasoning": "Brief reason for the priority choice"
            }
            """, taskTitle);
    }

    private String buildSummaryPrompt(List<Task> tasks) {
        long todo = tasks.stream().filter(t -> t.getStatus() == Task.Status.TODO).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count();
        long done = tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();
        long highPriority = tasks.stream()
                .filter(t -> t.getPriority() == Task.Priority.HIGH || t.getPriority() == Task.Priority.CRITICAL)
                .filter(t -> t.getStatus() != Task.Status.DONE).count();

        return String.format("""
            You are a productivity coach. Analyze these task statistics and provide insights.
            Task Stats:
            - Total Tasks: %d
            - TODO: %d, IN_PROGRESS: %d, DONE: %d
            - High/Critical Priority Pending: %d
            Respond ONLY with valid JSON in this exact format:
            {
              "summary": "2-3 sentence overall productivity summary",
              "productivityInsight": "One key insight about their work pattern",
              "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
            }
            """, tasks.size(), todo, inProgress, done, highPriority);
    }

    private AiGeneratedTask parseTaskGenerationResponse(String response, String title) {
        try {
            String cleaned = response.replaceAll("```json\\n?|```\\n?", "").trim();
            JsonNode node = objectMapper.readTree(cleaned);
            return AiGeneratedTask.builder()
                    .description(node.path("description").asText())
                    .priority(node.path("priority").asText("MEDIUM"))
                    .estimatedEffort(node.path("estimatedEffort").asText("2 hours"))
                    .reasoning(node.path("reasoning").asText())
                    .build();
        } catch (Exception e) {
            log.warn("Could not parse AI response as JSON, using fallback");
            return buildFallbackTaskDetails(title);
        }
    }

    private AiSummaryResponse parseSummaryResponse(String response, List<Task> tasks) {
        try {
            String cleaned = response.replaceAll("```json\\n?|```\\n?", "").trim();
            JsonNode node = objectMapper.readTree(cleaned);
            List<String> recommendations = objectMapper.convertValue(
                node.path("recommendations"),
                objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
            );
            long completedCount = tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();
            long highPriority = tasks.stream()
                    .filter(t -> t.getPriority() == Task.Priority.HIGH || t.getPriority() == Task.Priority.CRITICAL)
                    .filter(t -> t.getStatus() != Task.Status.DONE).count();
            return AiSummaryResponse.builder()
                    .summary(node.path("summary").asText())
                    .productivityInsight(node.path("productivityInsight").asText())
                    .recommendations(recommendations)
                    .totalTasks(tasks.size())
                    .completedToday(completedCount)
                    .pendingHighPriority(highPriority)
                    .build();
        } catch (Exception e) {
            return buildFallbackSummary(tasks);
        }
    }

    private AiGeneratedTask buildFallbackTaskDetails(String title) {
        return AiGeneratedTask.builder()
                .description("Complete the task: " + title + ". Break it into smaller steps and track progress.")
                .priority("MEDIUM").estimatedEffort("2 hours")
                .reasoning("Default estimate — AI service temporarily unavailable.")
                .build();
    }

    private AiSummaryResponse buildFallbackSummary(List<Task> tasks) {
        long done = tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();
        long pending = tasks.size() - done;
        return AiSummaryResponse.builder()
                .summary(String.format("You have %d tasks total, %d completed and %d pending.", tasks.size(), done, pending))
                .productivityInsight("Focus on your highest-priority pending tasks first.")
                .recommendations(List.of("Review and prioritize your pending tasks.",
                    "Break large tasks into smaller subtasks.",
                    "Set realistic due dates for better planning."))
                .totalTasks(tasks.size()).completedToday(done).pendingHighPriority(pending)
                .build();
    }
}