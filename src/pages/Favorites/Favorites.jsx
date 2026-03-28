import { Link } from "react-router-dom";
import { useFavorites } from "../../context/FavoritesContext";
import useFetch from "../../hooks/useFetch";
import { getTeamMatches } from "../../api/footballApi";
import PageHeader from "../../components/ui/PageHeader";
import TeamCrest from "../../components/ui/TeamCrest";
import EmptyState from "../../components/ui/EmptyState";
import MatchCard from "../../components/matches/MatchCard";
import Spinner from "../../components/ui/Spinner";

function FavTeamRow({ team }) {
  const { data, loading } = useFetch(
    (opts) => getTeamMatches(team.id, { status: "SCHEDULED", limit: 3 }, opts),
    [team.id]
  );
  const nextMatches = data?.matches || [];

  return (
    <div className="card p-4">
      <Link
        to={`/team/${team.id}`}
        className="flex items-center gap-3 mb-3 group"
      >
        <TeamCrest src={team.crest} name={team.name} size={32} />
        <span className="font-bold text-gray-900 group-hover:text-pitch-600 transition-colors">
          {team.name}
        </span>
      </Link>
      {loading ? (
        <Spinner size="sm" className="py-4" />
      ) : nextMatches.length > 0 ? (
        <div className="space-y-2">
          {nextMatches.map((m) => (
            <MatchCard key={m.id} match={m} showCompetition />
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400">No upcoming matches</p>
      )}
    </div>
  );
}

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div>
      <PageHeader
        title="Favorites"
        subtitle={`Tracking ${favorites.teams.length} team${
          favorites.teams.length !== 1 ? "s" : ""
        }`}
      />

      {favorites.teams.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No favorites yet"
          description="Click the star icon next to any team to follow them and see their upcoming matches here."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {favorites.teams.map((team) => (
            <FavTeamRow key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
