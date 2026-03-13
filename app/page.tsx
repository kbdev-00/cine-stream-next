import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import MoodMatcher from "@/components/MoodMatcher";
import MovieGrid from "@/components/MovieGrid";

export default async function Home({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.query || "";
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
  
  const tmdbUrl = query
    ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
    : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=1`;
  
  let movies = [];
  try {
    const res = await fetch(tmdbUrl, {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      movies = data.results || [];
    }
  } catch (error) {
    console.error("Failed to fetch movies", error);
  }

  return (
    <div>
      <SearchBar initialQuery={query} />
      <MoodMatcher />

      <MovieGrid initialMovies={movies} query={query} />
    </div>
  );
}