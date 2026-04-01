"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/user/use-current-user";
import { isAuthenticated } from "@/lib/utils/token-storage";
import Loader from "../elements/loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Kept for API compatibility — app is always open access */
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Loads workspace context (default guest user). No token gate.
 */
export const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectTo = "/sign-in",
}: ProtectedRouteProps) => {
  const router = useRouter();
  const authed = isAuthenticated();
  const [ready, setReady] = useState(false);
  const { isLoading, isError, user } = useCurrentUser({
    enabled: requireAuth && authed,
    retry: false,
  });

  useEffect(() => {
    if (!requireAuth) {
      setReady(true);
      return;
    }
    if (!authed) {
      router.replace(redirectTo);
      setReady(false);
      return;
    }
    if (!isLoading && (user || isError)) {
      setReady(true);
    }
  }, [requireAuth, authed, redirectTo, router, isLoading, user, isError]);

  if ((!ready && requireAuth && isLoading) || (requireAuth && !authed)) {
    return (
      <div className="bg-background/80 backdrop-blur-md h-full w-full flex items-center justify-center min-h-[40vh]">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
};
