"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { authService } from "@/services/auth.service";
import type { AuthState, LoginCredentials, User } from "@/types/auth.types";

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
}

type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from storage on mount
  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser && authService.isAuthenticated()) {
      dispatch({ type: "SET_USER", payload: storedUser });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await authService.login(credentials);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: response.user, token: response.access_token },
      });
      return response.user;
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context. Must be used within AuthProvider.
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
