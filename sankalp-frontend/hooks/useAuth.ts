"use client";

import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ROLES, ROUTES } from "@/lib/constants";

/**
 * Hook for authentication state and actions.
 * Provides role-based redirects after login/logout.
 */
export function useAuth() {
  const auth = useAuthContext();
  const router = useRouter();

  const loginAndRedirect = useCallback(
    async (credentials: Parameters<typeof auth.login>[0]) => {
      const user = await auth.login(credentials);
      // Route to appropriate dashboard based on role
      if (user.role === ROLES.SUPERVISOR) {
        router.push(ROUTES.SUPERVISOR.DASHBOARD);
      } else {
        router.push(ROUTES.WORKER.DASHBOARD);
      }
      return user;
    },
    [auth, router]
  );

  const logoutAndRedirect = useCallback(() => {
    auth.logout();
    router.push(ROUTES.LOGIN);
  }, [auth, router]);

  return {
    ...auth,
    loginAndRedirect,
    logoutAndRedirect,
    isSupervisor: auth.user?.role === ROLES.SUPERVISOR,
    isWorker:     auth.user?.role === ROLES.WORKER,
    workerId:     auth.user?.workerId ?? null,
  };
}
