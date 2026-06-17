import api from './api';
import type {
  Task, CreateTaskRequest, UpdateTaskRequest,
  TaskStats, PageResponse, ApiResponse
} from '../types';

export const taskService = {
  async getTasks(page = 0, size = 10): Promise<PageResponse<Task>> {
    const res = await api.get<ApiResponse<PageResponse<Task>>>(`/tasks?page=${page}&size=${size}`);
    return res.data.data;
  },

  async getTask(id: number): Promise<Task> {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data.data;
  },

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const res = await api.post<ApiResponse<Task>>('/tasks', data);
    return res.data.data;
  },

  async updateTask(id: number, data: UpdateTaskRequest): Promise<Task> {
    const res = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data.data;
  },

  async updateStatus(id: number, status: string): Promise<Task> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status?status=${status}`);
    return res.data.data;
  },

  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async getStats(): Promise<TaskStats> {
    const res = await api.get<ApiResponse<TaskStats>>('/tasks/stats');
    return res.data.data;
  },

  async searchTasks(keyword: string): Promise<Task[]> {
    const res = await api.get<ApiResponse<Task[]>>(`/tasks/search?keyword=${encodeURIComponent(keyword)}`);
    return res.data.data;
  },
};
