import { create } from 'zustand';
import type { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (authResponse: AuthResponse) => void;
  logout: () => void;
}

// Rehydrate from localStorage on startup
const storedToken = localStorage.getItem('taskflow_token');
const storedUser  = localStorage.getItem('taskflow_user');

export const useAuthStore = create<AuthState>((set) => ({
  token:           storedToken || null,
  user:            storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,

  setAuth: (authResponse: AuthResponse) => {
    const user: User = {
      userId:   authResponse.userId,
      fullName: authResponse.fullName,
      email:    authResponse.email,
      role:     authResponse.role,
    };
    localStorage.setItem('taskflow_token', authResponse.token);
    localStorage.setItem('taskflow_user', JSON.stringify(user));
    set({ token: authResponse.token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
