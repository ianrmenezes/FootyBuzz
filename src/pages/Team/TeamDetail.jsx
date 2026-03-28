import { useParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getTeam, getTeamMatches } from "../../api/footballApi";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import PageHeader from "../../components/ui/PageHeader";
import TeamCrest from "../../components/ui/TeamCrest";
import FavoriteButton from "../../components/ui/FavoriteButton";
import MatchList from "../../components/matches/MatchList";

export default function TeamDetail() {
  const { id } = useParams();

  const {
    data: team,
    loading: teamLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useFetch((opts) => getTeam(id, opts), [id]);

  const {
    data: matchData,
    loading: matchLoading,
  } = useFetch((opts) => getTeamMatches(id, { limit: 15 }, opts), [id]);

  if (teamLoading) return <Spinner />;
  if (teamError) return <ErrorMessage message={teamError} onRetry={refetchTeam} />;
  if (!team) return null;

  const squad = team.squad || [];
  const matches = matchData?.matches || [];
  const goalkeepers = squad.filter((p) => p.position === "Goalkeeper");
  const defenders = squad.filter((p) => p.position === "Defence");
  const midfielders = squad.filter((p) => p.position === "Midfield");
  const attackers = squad.filter((p) => p.position === "Offence");
  const coach = team.coach;

  return (
    <div>
      {/* Team Header */}
      <div className="card p-6 mb-8">
        <div className="flex items-start gap-5">
          <TeamCrest src={team.crest} name={team.name} size={72} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {team.name}
              </h1>
              <FavoriteButton
                team={{ id: team.id, name: team.name, crest: team.crest }}
                size="md"
              />
            </div>
            {team.shortName && (
              <p className="text-[13px] text-gray-500 mt-0.5">{team.shortName}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-[13px] text-gray-500">
              {team.founded && (
                <span>
                  🏛️ Founded {team.founded}
                </span>
              )}
              {team.venue && (
                <span>🏟️ {team.venue}</span>
              )}
              {team.clubColors && (
                <span>🎨 {team.clubColors}</span>
              )}
              {team.area?.name && (
                <span>📍 {team.area.name}</span>
              )}
            </div>
            {team.website && (
              <a
                href={team.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-[12px] text-pitch-600 hover:text-pitch-500 transition-colors"
              >
                🌐 {team.website}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Squad */}
        <div className="lg:col-span-2 space-y-6">
          {coach && (
            <div className="card p-4">
              <h3 className="text-[13px] font-bold text-gray-900 mb-3">🧑‍💼 Manager</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                  👔
                </div>
                <div>
                  <p className="text-[13px] font-medium text-gray-900">{coach.name}</p>
                  <p className="text-[11px] text-gray-400">
                    {coach.nationality || ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {[
            { label: "Goalkeepers", players: goalkeepers, icon: "🧤" },
            { label: "Defenders", players: defenders, icon: "🛡️" },
            { label: "Midfielders", players: midfielders, icon: "🎯" },
            { label: "Attackers", players: attackers, icon: "⚡" },
          ]
            .filter((g) => g.players.length > 0)
            .map((group) => (
              <div key={group.label} className="card p-4">
                <h3 className="text-[13px] font-bold text-gray-900 mb-3">
                  {group.icon} {group.label}
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400">
                        {p.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-700 truncate">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {p.nationality || ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Recent Matches */}
        <div>
          <div className="card p-4">
            <h3 className="text-[13px] font-bold text-gray-900 mb-4">
              📅 Recent & Upcoming
            </h3>
            {matchLoading ? (
              <Spinner size="sm" />
            ) : matches.length > 0 ? (
              <div className="space-y-2">
                {matches.slice(0, 10).map((m) => {
                  const isHome = m.homeTeam.id === Number(id);
                  const opponent = isHome ? m.awayTeam : m.homeTeam;
                  const ft = m.score?.fullTime;
                  const hasScore = ft?.home != null;
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 text-[13px]"
                    >
                      <TeamCrest
                        src={opponent.crest}
                        name={opponent.name}
                        size={18}
                      />
                      <span className="flex-1 truncate text-gray-600">
                        {isHome ? "vs" : "@"} {opponent.shortName || opponent.name}
                      </span>
                      {hasScore ? (
                        <span className="font-bold text-gray-900 tabular-nums text-[12px]">
                          {ft.home}–{ft.away}
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">
                          {new Date(m.utcDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">No matches available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
