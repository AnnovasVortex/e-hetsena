/**
 * Session côté navigateur : jetons dans localStorage, renouvellement automatique
 * de l'access token (15 min) via le refresh token (30 j).
 */

const TOKEN_KEY = 'ehetsena_token';
const REFRESH_KEY = 'ehetsena_refresh';
const USER_KEY = 'ehetsena_user';

export interface SessionUser {
  id: string;
  phoneNumber: string;
  fullName: string;
  city: string;
  role: string;
  avatarUrl?: string | null;
  trustScore?: number;
}

export function getAccessToken(): string | null {
  return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem(REFRESH_KEY);
}

export function getStoredUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: SessionUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Lien de connexion qui ramène sur la page courante après l'OTP */
export function loginUrl(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}

// Un seul renouvellement à la fois, même si plusieurs requêtes expirent ensemble
let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return false;

  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearSession();
    return false;
  }

  const tokens = await res.json();
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  return true;
}

/**
 * fetch authentifié : ajoute le Bearer et réessaie une fois après renouvellement sur 401.
 * Renvoie la réponse telle quelle ; un 401 final signifie que l'utilisateur doit se reconnecter.
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const withAuth = (): RequestInit => {
    const headers = new Headers(init.headers);
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return { ...init, headers };
  };

  const res = await fetch(input, withAuth());
  if (res.status !== 401) return res;

  refreshing ??= refreshTokens().finally(() => {
    refreshing = null;
  });

  return (await refreshing) ? fetch(input, withAuth()) : res;
}
