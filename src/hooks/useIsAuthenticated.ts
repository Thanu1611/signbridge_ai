"use client";

import { useApp } from "@/context/AppProvider";

/** True when the user has a signed-in session (not a guest). */
export function useIsAuthenticated(): boolean {
  const { user, isGuest } = useApp();
  return Boolean(user && !isGuest);
}
