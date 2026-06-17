import api from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, ApiResponse } from '../types';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },
};
