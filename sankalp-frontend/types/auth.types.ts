export type UserRole = "supervisor" | "worker";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workerId?: string;   // populated for worker-role accounts
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
