import { useState } from "react";
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

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeLeague = searchParams.get("league") || "";
  const { favorites } = useFavorites();

  function navTo(path) {
    return activeLeague ? `${path}?league=${activeLeague}` : path;
  }

  function selectLeague(code) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (code === activeLeague) next.delete("league");
      else next.set("league", code);
      return next;
    });
    setMobileOpen(false);
  }

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-pitch-600 flex items-center justify-center">
            <span className="text-base">⚽</span>
          </div>
          <span className="font-extrabold text-[15px] text-gray-900 tracking-tight">FootyBuzz</span>
        </div>

        {/* League Pill Scroller */}
        <div className="flex-1 mx-3 overflow-x-auto scrollbar-none">
          <div className="flex gap-1.5">
            {LEAGUES.slice(0, 6).map((l) => (
              <button
                key={l.code}
                onClick={() => selectLeague(l.code)}
                className={`shrink-0 text-xs px-2.5 py-1 rounded-full transition-all duration-200 ${
                  activeLeague === l.code
                    ? "bg-pitch-50 text-pitch-700 border border-pitch-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {l.flag}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-14 inset-x-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <nav className="flex flex-col p-3 gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={navTo(item.to)}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-pitch-50 text-pitch-700"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                <span className="w-5 text-center">{item.icon}</span>
                {item.label}
                {item.to === "/favorites" && favorites.teams.length > 0 && (
                  <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-semibold">
                    {favorites.teams.length}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="px-3 pb-3">
            <span className="section-title px-3 mb-2 block">
              Leagues
            </span>
            <div className="grid grid-cols-2 gap-0.5">
              {LEAGUES.map((league) => (
                <button
                  key={league.code}
                  onClick={() => selectLeague(league.code)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-left transition-all duration-200 ${
                    activeLeague === league.code
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{league.flag}</span>
                  <span className="truncate">{league.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
