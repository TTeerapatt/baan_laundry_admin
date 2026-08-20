export const ADMIN_TOKEN_KEY = "baan_laundry_token";
export const ADMIN_PROFILE_KEY = "baan_laundry_admin";

export type StoredAdmin = {
  id: string | number;
  email: string;
  display_name: string;
  role: string;
  created_at?: string;
  updated_at?: string;
};

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredAdmin(): StoredAdmin | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ADMIN_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAdmin;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
}
