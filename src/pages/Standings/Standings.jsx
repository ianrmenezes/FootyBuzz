import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getStandings, getCompetitionMatches } from "../../api/footballApi";
import { LEAGUES, DEFAULT_LEAGUE } from "../../utils/constants";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import PageHeader from "../../components/ui/PageHeader";
import TeamCrest from "../../components/ui/TeamCrest";
import FavoriteButton from "../../components/ui/FavoriteButton";
import Tabs from "../../components/ui/Tabs";

const TABLE_TYPES = [
  { value: "TOTAL", label: "Overall" },
  { value: "HOME", label: "Home" },
  { value: "AWAY", label: "Away" },
];

export default function Standings() {
  const [searchParams] = useSearchParams();
  const leagueCode = searchParams.get("league") || DEFAULT_LEAGUE.code;
  const league = LEAGUES.find((l) => l.code === leagueCode) || DEFAULT_LEAGUE;
  const [tableType, setTableType] = useState("TOTAL");

  const { data, loading, error, refetch } = useFetch(
    (opts) => getStandings(league.id, opts),
    [league.id]
  );

  // Check if API provides HOME/AWAY types natively
  const apiHasHomeAway = data?.standings?.some((s) => s.type === "HOME");

  // Only fetch matches if we need Home/Away AND the API doesn't provide them
  const needsMatches = tableType !== "TOTAL" && !apiHasHomeAway;
  const { data: matchData, loading: matchLoading } = useFetch(
    (opts) => getCompetitionMatches(league.id, { status: "FINISHED" }, opts),
    [league.id, needsMatches],
    { enabled: needsMatches }
  );

  const table = useMemo(() => {
    if (!data?.standings) return null;

    // Try API-provided table first (works for TOTAL, and HOME/AWAY if available)
    const apiTable = data.standings.find((s) => s.type === tableType)?.table;
    if (apiTable) return apiTable;

    // Fallback: TOTAL always exists
    const totalTable = data.standings.find((s) => s.type === "TOTAL")?.table;
    if (!totalTable || tableType === "TOTAL") return totalTable || null;

    // Compute HOME or AWAY from match results
    const matches = matchData?.matches || [];
    if (matches.length === 0) return totalTable; // fallback while loading

    const stats = {};
    for (const row of totalTable) {
      stats[row.team.id] = {
        team: row.team,
        playedGames: 0, won: 0, draw: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        form: null,
      };
    }

    for (const m of matches) {
      const home = m.homeTeam.id;
      const away = m.awayTeam.id;
      const hg = m.score?.fullTime?.home;
      const ag = m.score?.fullTime?.away;
      if (hg == null || ag == null) continue;

      if (tableType === "HOME" && stats[home]) {
        const s = stats[home];
        s.playedGames++;
        s.goalsFor += hg;
        s.goalsAgainst += ag;
        if (hg > ag) { s.won++; s.points += 3; }
        else if (hg === ag) { s.draw++; s.points += 1; }
        else { s.lost++; }
      }

      if (tableType === "AWAY" && stats[away]) {
        const s = stats[away];
        s.playedGames++;
        s.goalsFor += ag;
        s.goalsAgainst += hg;
        if (ag > hg) { s.won++; s.points += 3; }
        else if (ag === hg) { s.draw++; s.points += 1; }
        else { s.lost++; }
      }
    }

    return Object.values(stats)
      .map((s) => ({ ...s, goalDifference: s.goalsFor - s.goalsAgainst }))
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
      .map((s, i) => ({ ...s, position: i + 1 }));
  }, [data, matchData, tableType]);

  const season = data?.season;

  return (
    <div>
      <PageHeader
        title="Standings"
        subtitle={`${league.flag} ${league.name}${
          season ? ` — Matchday ${season.currentMatchday}` : ""
        }`}
      />

      <div className="mb-6">
        <Tabs tabs={TABLE_TYPES} active={tableType} onChange={setTableType} />
      </div>

      {loading || (needsMatches && matchLoading) ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : !table ? (
        <ErrorMessage message="No standings data available for this competition" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                  <th className="text-left py-3 px-4 w-10">#</th>
                  <th className="text-left py-3 px-2">Team</th>
                  <th className="text-center py-3 px-2 w-10">P</th>
                  <th className="text-center py-3 px-2 w-10">W</th>
                  <th className="text-center py-3 px-2 w-10">D</th>
                  <th className="text-center py-3 px-2 w-10">L</th>
                  <th className="text-center py-3 px-2 w-14">GF</th>
                  <th className="text-center py-3 px-2 w-14">GA</th>
                  <th className="text-center py-3 px-2 w-14">GD</th>
                  <th className="text-center py-3 px-4 w-14">Pts</th>
                  <th className="text-center py-3 px-3 w-36 hidden sm:table-cell">
                    Form
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, idx) => {
                  const zone = getZone(row.position, table.length);
                  return (
                    <tr
                      key={row.team.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        idx % 2 === 0 ? "" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-0.5 h-5 rounded-full ${zone}`}
                          />
                          <span className="text-[11px] font-bold text-gray-400 tabular-nums">
                            {row.position}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Link
                          to={`/team/${row.team.id}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <FavoriteButton
                            team={{
                              id: row.team.id,
                              name: row.team.name,
                              crest: row.team.crest,
                            }}
                          />
                          <TeamCrest
                            src={row.team.crest}
                            name={row.team.name}
                            size={22}
                          />
                          <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {row.team.shortName || row.team.name}
                          </span>
                        </Link>
                      </td>
                      <td className="text-center py-3 px-2 text-gray-500 tabular-nums">
                        {row.playedGames}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-700 font-medium tabular-nums">
                        {row.won}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-500 tabular-nums">
                        {row.draw}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-500 tabular-nums">
                        {row.lost}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-500 tabular-nums">
                        {row.goalsFor}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-500 tabular-nums">
                        {row.goalsAgainst}
                      </td>
                      <td
                        className={`text-center py-3 px-2 font-medium tabular-nums ${
                          row.goalDifference > 0
                            ? "text-pitch-600"
                            : row.goalDifference < 0
                            ? "text-red-600"
                            : "text-gray-400"
                        }`}
                      >
                        {row.goalDifference > 0 ? "+" : ""}
                        {row.goalDifference}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-900 font-bold tabular-nums">
                        {row.points}
                      </td>
                      <td className="text-center py-3 px-3 hidden sm:table-cell">
                        {row.form ? (
                          <div className="flex gap-1 justify-center">
                            {row.form.split(",").map((r, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                  r === "W"
                                    ? "bg-pitch-50 text-pitch-600"
                                    : r === "D"
                                    ? "bg-yellow-50 text-amber-500"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-gray-200 text-[10px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pitch-500" />
              Champions League
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Europa League
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Relegation
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function getZone(position, total) {
  if (position <= 4) return "bg-pitch-500"; // UCL
  if (position <= 6) return "bg-blue-500"; // UEL
  if (position >= total - 2) return "bg-red-500"; // Relegation
  return "bg-transparent";
}
