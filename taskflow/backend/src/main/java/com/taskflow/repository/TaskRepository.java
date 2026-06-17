package com.taskflow.repository;

import com.taskflow.entity.Task;
import com.taskflow.entity.Task.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Task entity with custom query methods.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find all tasks for a specific user with pagination
    Page<Task> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Find all tasks for a user (no pagination, for AI summarization)
    List<Task> findByUserId(Long userId);

    // Find task by id and verify it belongs to the user (security check)
    Optional<Task> findByIdAndUserId(Long id, Long userId);

    // Find tasks by status for a user
    List<Task> findByUserIdAndStatus(Long userId, Status status);

    // Count tasks by status for a user (dashboard stats)
    long countByUserIdAndStatus(Long userId, Status status);

    // Search tasks by title or description (case-insensitive)
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Task> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);

    // Find overdue tasks (due date passed and not done)
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND " +
           "t.dueDate < :today AND t.status != 'DONE'")
    List<Task> findOverdueTasks(@Param("userId") Long userId, @Param("today") LocalDate today);

    // Find tasks due soon (within next 3 days)
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND " +
           "t.dueDate BETWEEN :today AND :soonDate AND t.status != 'DONE'")
    List<Task> findTasksDueSoon(@Param("userId") Long userId,
                                 @Param("today") LocalDate today,
                                 @Param("soonDate") LocalDate soonDate);
}
