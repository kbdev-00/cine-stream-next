"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useFavorites, Movie } from "./FavoritesContext";
import { useDebounce } from "@/hooks/useDebounce";

export default function HomePageClient({ initialMovies }: { initialMovies: Movie[] }) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [mood, setMood] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);
  const debouncedQuery = useDebounce(query, 500);
  const { favorites, toggleFavorite } = useFavorites();
  
  // Track if it's the first render to avoid fetching initial movies again
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) return;
    setPage(1);
    setMovies([]);
  }, [debouncedQuery]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchMovies(debouncedQuery, page);
  }, [page, debouncedQuery]);

  const fetchMovies = (searchText = "", currentPage = 1) => {
    setLoading(true);
    const tmdbUrl = searchText
      ? `https://api.themoviedb.org/3/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&query=${searchText}&page=${currentPage}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}&page=${currentPage}`;

    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(tmdbUrl)}`;

    fetch(proxyUrl)
      .then((res) => res.json())
      .then((data) => {
        if (currentPage === 1) {
          setMovies(data.results || []);
        } else {
          setMovies((prev) => {
            const newMovies = data.results || [];
            const existingIds = new Set(prev.map(m => m.id));
            return [...prev, ...newMovies.filter((m: Movie) => !existingIds.has(m.id))];
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  };

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
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
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
        setQuery(movieTitle);
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

  const lastMovieRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  return (
    <div>
      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "none",
          marginRight: "20px",
          color: "black"
        }}
      />

      {/* 🤖 Mood Matcher */}
      <div style={{ marginBottom: "25px", display: "inline-block" }}>
        <input
          type="text"
          placeholder="Describe your mood for AI..."
          value={mood}
          onChange={(e) => setMood(e.target.value)}
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
          style={{
            padding: "10px",
            marginLeft: "10px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            borderRadius: "5px"
          }}
        >
          AI Suggest
        </button>
      </div>

      {/* 🎬 Movies Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px"
        }}
      >
        {movies.map((movie, index) => {
          const isFav = favorites.find((fav) => fav.id === movie.id);
          const isLast = movies.length === index + 1;

          return (
            <div
              ref={isLast ? lastMovieRef : null}
              key={movie.id}
              style={{
                background: "#1c1c1c",
                padding: "10px",
                borderRadius: "8px",
                position: "relative"
              }}
            >
              <Link href={`/movie/${movie.id}`}>
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  loading="lazy"
                  style={{ width: "100%", borderRadius: "6px" }}
                />
              </Link>
              <h3 style={{ marginBottom: "5px" }}>{movie.title}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#ccc", fontSize: "0.9rem" }}>
                <span>{movie.release_date?.substring(0, 4) || "Unknown Year"}</span>
                <span>⭐ {movie.vote_average?.toFixed(1) || "NR"}</span>
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(movie);
                }}
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "22px",
                  color: isFav ? "red" : "white",
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  borderRadius: "50%",
                  padding: "5px"
                }}
              >
                ❤️
              </button>
            </div>
          );
        })}
      </div>

      {loading && <h2 style={{ marginTop: "20px" }}>Loading more...</h2>}
    </div>
  );
}
