const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export async function translateText({
  text,
  sourceLanguage,
  targetLanguage,
}) {
  const response = await fetch(
    `${API_BASE_URL}/api/translate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",

      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Translation failed"
    );
  }

  return data.translation;
}