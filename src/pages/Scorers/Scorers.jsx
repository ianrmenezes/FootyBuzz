import { useSearchParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getScorers } from "../../api/footballApi";
import { LEAGUES, DEFAULT_LEAGUE } from "../../utils/constants";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import PageHeader from "../../components/ui/PageHeader";
import TeamCrest from "../../components/ui/TeamCrest";

export default function Scorers() {
  const [searchParams] = useSearchParams();
  const leagueCode = searchParams.get("league") || DEFAULT_LEAGUE.code;
  const league = LEAGUES.find((l) => l.code === leagueCode) || DEFAULT_LEAGUE;

  const { data, loading, error, refetch } = useFetch(
    (opts) => getScorers(league.id, 40, opts),
    [league.id]
  );

  const scorers = data?.scorers || [];

  return (
    <div>
      <PageHeader
        title="Top Scorers"
        subtitle={`${league.flag} ${league.name} — Golden Boot Race`}
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                  <th className="text-left py-3 px-4 w-10">#</th>
                  <th className="text-left py-3 px-2">Player</th>
                  <th className="text-left py-3 px-2 hidden sm:table-cell">
                    Team
                  </th>
                  <th className="text-left py-3 px-2 hidden md:table-cell">
                    Nationality
                  </th>
                  <th className="text-center py-3 px-2 w-16">Games</th>
                  <th className="text-center py-3 px-2 w-16">Goals</th>
                  <th className="text-center py-3 px-2 w-16">Assists</th>
                  <th className="text-center py-3 px-2 w-20 hidden sm:table-cell">
                    Penalties
                  </th>
                </tr>
              </thead>
              <tbody>
                {scorers.map((s, index) => {
                  const medal =
                    index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : null;
                  return (
                    <tr
                      key={`${s.player.id}-${index}`}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index < 3 ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        {medal ? (
                          <span className="text-base">{medal}</span>
                        ) : (
                          <span className="text-[11px] font-bold text-gray-400 tabular-nums">
                            {index + 1}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p
                            className={`font-medium ${
                              index < 3 ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {s.player.name}
                          </p>
                          <p className="text-[10px] text-gray-400 sm:hidden flex items-center gap-1">
                            <TeamCrest
                              src={s.team.crest}
                              name={s.team.name}
                              size={12}
                            />
                            {s.team.shortName || s.team.name}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <TeamCrest
                            src={s.team.crest}
                            name={s.team.name}
                            size={20}
                          />
                          <span className="text-gray-500 truncate">
                            {s.team.shortName || s.team.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-500 hidden md:table-cell">
                        {s.player.nationality || "—"}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-500 tabular-nums">
                        {s.playedMatches ?? "—"}
                      </td>
                      <td className="text-center py-3 px-2">
                        <span
                          className={`font-bold tabular-nums ${
                            index < 3 ? "text-pitch-600 text-base" : "text-gray-900"
                          }`}
                        >
                          {s.goals}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2 text-gray-500 tabular-nums">
                        {s.assists ?? "—"}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-400 tabular-nums hidden sm:table-cell">
                        {s.penalties ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
