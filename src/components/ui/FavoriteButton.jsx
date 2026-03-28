import { useFavorites } from "../../context/FavoritesContext";

export default function FavoriteButton({ team, size = "sm" }) {
  const { isTeamFav, toggleTeam } = useFavorites();
  const isFav = isTeamFav(team.id);

  const sizes = {
    sm: "w-7 h-7 text-sm",
    md: "w-9 h-9 text-base",
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTeam(team);
      }}
      title={isFav ? "Remove from favorites" : "Add to favorites"}
      className={`${sizes[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
        isFav
          ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
          : "bg-gray-100 text-gray-400 hover:text-amber-500 hover:bg-amber-50"
      }`}
    >
      {isFav ? "★" : "☆"}
    </button>
  );
}
