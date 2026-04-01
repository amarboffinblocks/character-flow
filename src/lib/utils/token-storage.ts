/**
 * Legacy token helpers — the API uses server-side guest context (no real JWT).
 * We keep a lightweight client auth flag so login/logout UX still behaves as expected.
 */
const OPEN_ACCESS = "open-access";
const AUTH_FLAG_KEY = "yu_open_access_enabled";

const isBrowser = () => typeof window !== "undefined";

const readAuthFlag = (): boolean => {
  if (!isBrowser()) return true;
  try {
    const value = window.localStorage.getItem(AUTH_FLAG_KEY);
    if (value === null) return true;
    return value === "1";
  } catch {
    return true;
  }
};

const writeAuthFlag = (enabled: boolean): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(AUTH_FLAG_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore storage failures; app will keep open-access defaults.
  }
};

export const getAccessToken = (): string | null => (readAuthFlag() ? OPEN_ACCESS : null);

export const getRefreshToken = (): string | null => null;

export const storeTokens = (_tokens: { accessToken: string; refreshToken: string }): void => {
  writeAuthFlag(true);
};

export const clearTokens = (): void => {
  writeAuthFlag(false);
};

export const isAuthenticated = (): boolean => readAuthFlag();
