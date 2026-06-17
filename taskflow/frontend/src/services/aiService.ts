import api from './api';
import type { AiGeneratedTask, AiSummaryResponse, ApiResponse } from '../types';

export const aiService = {
  async generateTaskDetails(title: string): Promise<AiGeneratedTask> {
    const res = await api.post<ApiResponse<AiGeneratedTask>>('/ai/generate-task', { title });
    return res.data.data;
  },

  async getProductivitySummary(): Promise<AiSummaryResponse> {
    const res = await api.get<ApiResponse<AiSummaryResponse>>('/ai/summary');
    return res.data.data;
  },
};
