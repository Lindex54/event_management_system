import { API_BASE_URL } from "@/lib/api/config";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  id?: number;
  message?: string;
}

export async function adminApi<T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_BASE_URL}/api/admin${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const result = await response.json().catch(() => ({ success: false, message: "Invalid server response" })) as ApiEnvelope<T>;
  // A full navigation clears stale client state when an administrator session expires.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  if (response.status === 401 && typeof window !== "undefined") window.location.href = "/admin/login";
  if (!response.ok || !result.success) throw new Error(result.message ?? "The request could not be completed");
  return result;
}
