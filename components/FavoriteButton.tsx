"use client";

import { Movie, useFavorites } from "./FavoritesContext";

export default function FavoriteButton({ movie }: { movie: Movie }) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFav = favorites.find((fav) => fav.id === movie.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
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
        padding: "5px",
        zIndex: 10
      }}
    >
      ❤️
    </button>
  );
}
