import { useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getDashboardData } from "../../api/footballApi";
import { LEAGUES, DEFAULT_LEAGUE, LIVE_STATUSES, FINISHED_STATUSES, UPCOMING_STATUSES } from "../../utils/constants";
import MatchCard from "../../components/matches/MatchCard";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import TeamCrest from "../../components/ui/TeamCrest";
import { formatRelativeDate } from "../../utils/helpers";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const leagueCode = searchParams.get("league") || "";
  const league = LEAGUES.find((l) => l.code === leagueCode) || DEFAULT_LEAGUE;

  // Single combined request: matches + standings + scorers
  const {
    data: dashData,
    loading: dashLoading,
    error: dashError,
    refetch,
  } = useFetch((opts) => getDashboardData(league.id, opts), [league.id], { autoRefresh: 120000 });

  const matchData = dashData?.matches;
  const standingsData = dashData?.standings;
  const scorersData = dashData?.scorers;
  const matchLoading = dashLoading;
  const matchError = dashError;
  const standingsLoading = dashLoading;
  const scorersLoading = dashLoading;

  const allMatches = useMemo(() => matchData?.matches || [], [matchData]);

  const todayStr = new Date().toLocaleDateString("en-CA");

  const todayMatches = useMemo(
    () => allMatches.filter((m) => new Date(m.utcDate).toLocaleDateString("en-CA") === todayStr),
    [allMatches, todayStr]
  );

  const liveMatches = useMemo(
    () => allMatches.filter((m) => LIVE_STATUSES.includes(m.status)),
    [allMatches]
  );

  const recentResults = useMemo(
    () => allMatches
      .filter((m) => FINISHED_STATUSES.includes(m.status))
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
      .slice(0, 8),
    [allMatches]
  );

  const upcomingMatches = useMemo(
    () => allMatches
      .filter((m) => UPCOMING_STATUSES.includes(m.status))
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
      .slice(0, 8),
    [allMatches]
  );

  const standings = standingsData?.standings?.find(
    (s) => s.type === "TOTAL"
  )?.table;

  const scorers = scorersData?.scorers;

  const hasTodayOrLive = todayMatches.length > 0 || liveMatches.length > 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live scores, recent results & upcoming fixtures"
      />

      {/* Live Matches Banner */}
      {liveMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-[13px] font-bold text-red-600 uppercase tracking-wider">
              Live Now
            </h2>
            <span className="text-[11px] text-gray-400">
              {liveMatches.length} match{liveMatches.length !== 1 && "es"}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} showCompetition />
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {matchLoading ? (
            <Spinner />
          ) : matchError ? (
            <ErrorMessage message={matchError} onRetry={refetch} />
          ) : (
            <>
              {/* Today's Matches (if any) */}
              {todayMatches.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-gray-900">Today's Matches</h2>
                    <Link to="/matches" className="text-[13px] text-pitch-600 hover:text-pitch-500 font-medium transition-colors">
                      View all →
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {todayMatches.slice(0, 8).map((m) => (
                      <MatchCard key={m.id} match={m} showCompetition />
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Results */}
              {recentResults.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-sm opacity-70">📋</span> Recent Results
                    </h2>
                    <Link to="/matches" className="text-[13px] text-pitch-600 hover:text-pitch-500 font-medium transition-colors">
                      View all →
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {recentResults.map((m) => (
                      <MatchCard key={m.id} match={m} showCompetition />
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Fixtures */}
              {upcomingMatches.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-sm opacity-70">📅</span> Upcoming Fixtures
                    </h2>
                    <Link to="/matches" className="text-[13px] text-pitch-600 hover:text-pitch-500 font-medium transition-colors">
                      View all →
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {upcomingMatches.map((m) => (
                      <MatchCard key={m.id} match={m} showCompetition />
                    ))}
                  </div>
                </section>
              )}

              {/* Nothing at all */}
              {recentResults.length === 0 && upcomingMatches.length === 0 && todayMatches.length === 0 && (
                <EmptyState
                  icon="⚽"
                  title="No matches right now"
                  description="Check back soon — leagues are on a break"
                />
              )}
            </>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Mini Standings */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-gray-900">
                {league.flag} Standings
              </h3>
              <Link
                to={`/standings?league=${league.code}`}
                className="text-[11px] text-pitch-600 hover:text-pitch-500 font-medium transition-colors"
              >
                Full table →
              </Link>
            </div>
            {standingsLoading ? (
              <Spinner size="sm" />
            ) : standings ? (
              <div className="space-y-2.5">
                {standings.slice(0, 6).map((row) => (
                  <div
                    key={row.position}
                    className="flex items-center gap-2 text-[13px]"
                  >
                    <span
                      className={`w-5 text-right text-[11px] font-bold ${
                        row.position <= 4
                          ? "text-pitch-600"
                          : row.position >= (standings.length - 2)
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    >
                      {row.position}
                    </span>
                    <TeamCrest src={row.team.crest} name={row.team.name} size={18} />
                    <span className="text-gray-600 truncate flex-1 text-[12px]">
                      {row.team.shortName || row.team.name}
                    </span>
                    <span className="text-gray-900 font-bold text-[12px] tabular-nums">
                      {row.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">No standings available</p>
            )}
          </div>

          {/* Mini Scorers */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-gray-900">
                🥇 Top Scorers
              </h3>
              <Link
                to={`/scorers?league=${league.code}`}
                className="text-[11px] text-pitch-600 hover:text-pitch-500 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            {scorersLoading ? (
              <Spinner size="sm" />
            ) : scorers && scorers.length > 0 ? (
              <div className="space-y-3">
                {scorers.slice(0, 5).map((s, i) => (
                  <div key={s.player.id} className="flex items-center gap-3">
                    <span
                      className={`w-5 text-center text-[11px] font-bold ${
                        i === 0
                          ? "text-amber-500"
                          : i === 1
                          ? "text-gray-400"
                          : i === 2
                          ? "text-amber-600"
                          : "text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 truncate">
                        {s.player.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <TeamCrest
                          src={s.team.crest}
                          name={s.team.name}
                          size={12}
                        />
                        <span className="text-[10px] text-gray-400 truncate">
                          {s.team.shortName || s.team.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-bold text-pitch-600 tabular-nums">
                        {s.goals}
                      </span>
                      {s.assists > 0 && (
                        <span className="text-[10px] text-gray-400 ml-1">
                          ({s.assists}a)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">No scorer data available</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card p-5">
            <h3 className="text-[13px] font-bold text-gray-900 mb-3">
              ⚡ Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Today",
                  value: todayMatches.length,
                  sub: "matches",
                  color: "text-blue-600",
                },
                {
                  label: "Live",
                  value: liveMatches.length,
                  sub: "right now",
                  color: "text-red-600",
                },
                {
                  label: "Upcoming",
                  value: upcomingMatches.length,
                  sub: "this week",
                  color: "text-purple-600",
                },
                {
                  label: "Top Scorer",
                  value: scorers?.[0]?.goals || "—",
                  sub: "goals",
                  color: "text-amber-500",
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 mb-0.5 font-medium uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold ${stat.color} tabular-nums`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-gray-300">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
