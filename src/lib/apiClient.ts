export async function apiRequest(path: string, options: RequestInit = {}) {
  const baseUrl = import.meta.env.VITE_CLOUDRUN_API_URL?.replace(/\/$/, ""); // 末尾の / を削除
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;      // 必ず 1 つだけ / が入る
  console.log("[apiRequest] URL:", url); // ←デバッグ出力

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
