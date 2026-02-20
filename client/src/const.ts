export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "";
  const appId = import.meta.env.VITE_APP_ID || "";

  // If OAuth is not configured, return empty string to disable login
  if (!oauthPortalUrl || !appId) {
    console.warn("[Auth] OAuth not configured: VITE_OAUTH_PORTAL_URL and VITE_APP_ID are required");
    return "";
  }

  // Validate window.location before creating URLs
  if (typeof window === "undefined" || !window.location || !window.location.origin || window.location.origin === "null") {
    console.warn("[Auth] Invalid window.location.origin");
    return "";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("[Auth] Failed to create login URL:", error);
    return "";
  }
};
