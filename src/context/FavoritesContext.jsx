import { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

const STORAGE_KEY = "footybuzz-favorites";

function loadFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { teams: [], leagues: [] };
  } catch {
    return { teams: [], leagues: [] };
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function toggleTeam(team) {
    setFavorites((prev) => {
      const exists = prev.teams.some((t) => t.id === team.id);
      return {
        ...prev,
        teams: exists
          ? prev.teams.filter((t) => t.id !== team.id)
          : [...prev.teams, { id: team.id, name: team.name, crest: team.crest }],
      };
    });
  }

  function toggleLeague(league) {
    setFavorites((prev) => {
      const exists = prev.leagues.some((l) => l.id === league.id);
      return {
        ...prev,
        leagues: exists
          ? prev.leagues.filter((l) => l.id !== league.id)
          : [...prev.leagues, { id: league.id, name: league.name, code: league.code }],
      };
    });
  }

  function isTeamFav(teamId) {
    return favorites.teams.some((t) => t.id === teamId);
  }

  function isLeagueFav(leagueId) {
    return favorites.leagues.some((l) => l.id === leagueId);
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleTeam, toggleLeague, isTeamFav, isLeagueFav }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
