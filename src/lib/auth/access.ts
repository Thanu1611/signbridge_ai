/** Session cookie — must match lib/auth/session.ts */
export const SESSION_COOKIE_NAME = "signbridge_session";

export const LOGIN_REQUIRED_MESSAGE =
  "Please log in to access this feature.";

/** Pages guests may visit without signing in */
export const GUEST_ALLOWED_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/translator",
]);

/** API routes guests may call (demo translator + auth) */
export const GUEST_ALLOWED_API_PREFIXES = [
  "/api/auth",
  "/api/health",
  "/api/tts",
] as const;

export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

/** Guest navigation — preview/demo only */
export const GUEST_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/translator", label: "Live Sign Translation", icon: "Camera" },
];

/** Full navigation for authenticated users */
export const AUTH_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/translator", label: "Translate", icon: "Camera" },
  { href: "/voice", label: "Voice", icon: "Mic" },
  { href: "/emergency", label: "Emergency", icon: "AlertTriangle" },
  { href: "/learn", label: "Learn", icon: "BookOpen" },
  { href: "/history", label: "History", icon: "History" },
];

export function getNavItems(isAuthenticated: boolean): NavItem[] {
  return isAuthenticated ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS;
}

export function isGuestAllowedPath(pathname: string): boolean {
  if (GUEST_ALLOWED_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return true;
  }
  return false;
}

export function isGuestAllowedApi(pathname: string): boolean {
  return GUEST_ALLOWED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}
