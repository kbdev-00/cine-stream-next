"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MoodMatcher() {
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMoodSearch = async () => {
    if (!mood) return;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_KEY;
    if (!apiKey) {
      alert("Please set NEXT_PUBLIC_GEMINI_KEY in your .env.local file!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
             contents: [
              {
                parts: [
                  {
                    text: `Based on this exact mood/prompt: "${mood}", recommend ONE single movie that best fits. Return ONLY a valid JSON object in this exact format, with no markdown, backticks, or other text: {"title": "The exact movie title"}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      let movieTitle = "";
      try {
        const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        movieTitle = parsed.title;
      } catch (e) {
        movieTitle = rawText.replace(/["']/g, '');
      }

      if (movieTitle) {
        router.push(`/?query=${encodeURIComponent(movieTitle)}`);
      } else {
        alert("Couldn't find a recommendation for that mood. Try again!");
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      alert(`Failed to connect to the AI: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "25px", display: "inline-block" }}>
      <input
        type="text"
        placeholder="Describe your mood for AI..."
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        disabled={loading}
        style={{
          padding: "10px",
          width: "300px",
          borderRadius: "5px",
          border: "none",
          color: "black"
        }}
      />
      <button
        onClick={handleMoodSearch}
        disabled={loading}
        style={{
          padding: "10px",
          marginLeft: "10px",
          backgroundColor: loading ? "#777" : "red",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
          borderRadius: "5px"
        }}
      >
        {loading ? "Matching..." : "AI Suggest"}
      </button>
    </div>
  );
}
