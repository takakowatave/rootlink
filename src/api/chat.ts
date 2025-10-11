// rootlink/src/api/chat.ts
export async function callServer(message: string) {
  try {
    const res = await fetch(`${import.meta.env.VITE_CLOUDRUN_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`);
    }

    const data = await res.json();
    console.log("🌐 Hono API response:", data);
    return data;
  } catch (error) {
    console.error("❌ Failed to call server:", error);
    return null;
  }
}
