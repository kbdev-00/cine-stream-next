import SearchBar from "@/components/SearchBar";
import MoodMatcher from "@/components/MoodMatcher";
import MovieGrid from "@/components/MovieGrid";

export default async function Home({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams?.query || "";
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;

  const tmdbUrl = query
    ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
    : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=1`;

  let movies: any[] = [];

  try {
    const res = await fetch(tmdbUrl, {
      cache: "no-store", // important for infinite scroll in production
    });

    if (!res.ok) {
      throw new Error("Failed to fetch movies");
    }

    const data = await res.json();
    movies = data.results || [];
  } catch (error) {
    console.error("Movie fetch error:", error);
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <SearchBar initialQuery={query} />
      <MoodMatcher />

      {/* initial 20 movies */}
      <MovieGrid initialMovies={movies} query={query} />
    </main>
  );
}
