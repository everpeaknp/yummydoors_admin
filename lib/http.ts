export async function readJsonPayload<T = unknown>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {
      detail: response.headers.get("content-type")?.includes("text/html")
        ? "Upstream service returned HTML instead of JSON."
        : text
    } as T;
  }
}
