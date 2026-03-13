"use client";

import { useFavorites } from "@/components/FavoritesContext";
import Link from "next/link";

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();

  if (favorites.length === 0) {
    return <h2>You have no favorites yet. Go add some!</h2>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px"
      }}
    >
      {favorites.map((movie) => {
        return (
          <div
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
              onClick={() => toggleFavorite(movie)}
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "none",
                cursor: "pointer",
                fontSize: "22px",
                color: "red",
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
  );
}
