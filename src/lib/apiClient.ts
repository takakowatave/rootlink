// src/lib/apiClient.ts
export async function apiRequest(path: string, options: RequestInit = {}) {
  const baseUrl = import.meta.env.VITE_CLOUDRUN_API_URL;
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
