import { NavLink, useSearchParams, useLocation } from "react-router-dom";
import { LEAGUES } from "../../utils/constants";
import { useFavorites } from "../../context/FavoritesContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/matches", label: "Matches", icon: "⚽" },
  { to: "/standings", label: "Standings", icon: "🏆" },
  { to: "/scorers", label: "Top Scorers", icon: "🥇" },
  { to: "/favorites", label: "Favorites", icon: "⭐" },
];

export default function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const activeLeague = searchParams.get("league") || "";
  const { favorites } = useFavorites();

  function navTo(path) {
    return activeLeague ? `${path}?league=${activeLeague}` : path;
  }

  function selectLeague(code) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (code === activeLeague) {
        next.delete("league");
      } else {
        next.set("league", code);
      }
      return next;
    });
  }

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen sticky top-0 border-r border-gray-200 bg-white overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-pitch-600 flex items-center justify-center">
          <span className="text-lg">⚽</span>
        </div>
        <div>
          <h1 className="text-[15px] font-extrabold tracking-tight text-gray-900">
            FootyBuzz
          </h1>
          <p className="text-[10px] text-gray-400 font-semibold tracking-[0.12em] uppercase">
            Live Dashboard
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 pt-5 pb-2">
        <span className="section-title px-3 mb-2">
          Menu
        </span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={navTo(item.to)}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-pitch-50 text-pitch-700 border border-pitch-100"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
            {item.to === "/favorites" && favorites.teams.length > 0 && (
              <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-semibold">
                {favorites.teams.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Leagues */}
      <div className="flex flex-col gap-0.5 px-3 pt-3 pb-2 flex-1">
        <span className="section-title px-3 mb-2">
          Leagues
        </span>
        <div className="flex flex-col gap-0.5">
          {LEAGUES.map((league) => (
            <button
              key={league.code}
              onClick={() => selectLeague(league.code)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-200 text-left ${
                activeLeague === league.code
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base w-5 text-center">{league.flag}</span>
              <span className="truncate">{league.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">
          Powered by{" "}
          <a
            href="https://www.football-data.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-pitch-600 transition-colors"
          >
            football-data.org
          </a>
        </p>
      </div>
    </aside>
  );
}
