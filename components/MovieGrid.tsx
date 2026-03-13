"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { Movie } from "@/components/FavoritesContext";

interface Props {
  initialMovies: Movie[];
  query: string;
}

export default function MovieGrid({ initialMovies, query }: Props) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setMovies(initialMovies);
    setPage(1);
  }, [initialMovies, query]);

  const fetchMoreMovies = async (currentPage: number) => {
    setLoading(true);
    const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
    const tmdbUrl = query
      ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${currentPage}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${currentPage}`;

    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(tmdbUrl)}`;

    try {
      const res = await fetch(proxyUrl);
      const data = await res.json();
      if (data.results) {
        setMovies((prev) => {
          const newMovies = data.results || [];
          const existingIds = new Set(prev.map(m => m.id));
          return [...prev, ...newMovies.filter((m: Movie) => !existingIds.has(m.id))];
        });
      }
    } catch (error) {
      console.error("Error fetching more movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchMoreMovies(page);
    }
  }, [page]);

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
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px"
        }}
      >
        {movies.map((movie, index) => {
          const isLast = movies.length === index + 1;

          return (
            <div
              ref={isLast ? lastMovieRef : null}
              key={`${movie.id}-${index}`}
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

              <FavoriteButton movie={movie} />
            </div>
          );
        })}
      </div>

      {loading && <h2 style={{ marginTop: "20px" }}>Loading more movies...</h2>}
      {!loading && movies.length === 0 && <h2 style={{ marginTop: "20px" }}>No movies found.</h2>}
    </>
  );
}
