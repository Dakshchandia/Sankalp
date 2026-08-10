import api from "./api";
import Cookies from "js-cookie";
import { TOKEN_KEY, USER_KEY } from "@/lib/constants";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth.types";

/**
 * Authentication service for SANKALP platform.
 * Manages login, logout, and token persistence.
 */
export const authService = {
  /**
   * Login with email and password.
   * Stores JWT token in cookies (or localStorage based on rememberMe).
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    });

    // Persist token
    if (credentials.rememberMe) {
      Cookies.set(TOKEN_KEY, data.access_token, { expires: 30 });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } else {
      Cookies.set(TOKEN_KEY, data.access_token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Logout the current user and clear all auth state.
   */
  logout(): void {
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  /**
   * Get the currently stored user from storage.
   */
  getCurrentUser(): User | null {
    try {
      const stored =
        localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  },

  /**
   * Check if a valid token exists.
   */
  isAuthenticated(): boolean {
    const token =
      Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    return !!token;
  },

  /**
   * Change password for the current user.
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /**
   * Get the current user profile from API.
   */
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
