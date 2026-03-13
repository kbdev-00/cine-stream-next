import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
  const movieRes = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
  
  if (!movieRes.ok) {
    return {
      title: "Movie Not Found",
      description: "Could not find the movie details."
    };
  }
  
  const movie = await movieRes.json();
  
  return {
    title: `${movie.title} - Cine Stream`,
    description: movie.overview || `View details about ${movie.title} on Cine Stream.`,
  };
}

export default async function MovieDetailsPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
  const movieRes = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
  
  if (!movieRes.ok) {
    return <h2>Error loading movie details.</h2>;
  }
  
  const movie = await movieRes.json();

  return (
    <div style={{ padding: "20px", background: "#1c1c1c", borderRadius: "10px", display: "flex", gap: "30px", flexWrap: "wrap" }}>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        style={{ width: "300px", borderRadius: "10px", flexShrink: 0 }}
      />
      <div style={{ flex: "1", minWidth: "300px" }}>
        <h1>{movie.title}</h1>
        {movie.tagline && <p style={{ color: "#aaa", fontStyle: "italic", marginBottom: "10px" }}>{movie.tagline}</p>}
        <p><strong>Release Date:</strong> {movie.release_date}</p>
        <p><strong>Rating:</strong> ⭐ {movie.vote_average?.toFixed(1)}</p>
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: "10px" }}>Overview</h3>
          <p style={{ lineHeight: "1.6" }}>{movie.overview}</p>
        </div>
      </div>
    </div>
  );
}
