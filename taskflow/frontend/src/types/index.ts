// ─── Auth Types ───────────────────────────────────────────────
export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

// ─── Task Types ───────────────────────────────────────────────
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TaskStatus   = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;          // ISO date string
  estimatedEffort: string | null;
  taskHash: string | null;         // Blockchain hash
  createdAt: string;
  updatedAt: string;
  userId: number;
  isOverdue: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  estimatedEffort?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  estimatedEffort?: string;
}

export interface TaskStats {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  overdueCount: number;
  dueSoonCount: number;
}

// ─── Pagination ───────────────────────────────────────────────
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

// ─── API Wrapper ──────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── AI Types ─────────────────────────────────────────────────
export interface AiGeneratedTask {
  description: string;
  priority: string;
  estimatedEffort: string;
  reasoning: string;
}

export interface AiSummaryResponse {
  summary: string;
  productivityInsight: string;
  recommendations: string[];
  totalTasks: number;
  completedToday: number;
  pendingHighPriority: number;
}
