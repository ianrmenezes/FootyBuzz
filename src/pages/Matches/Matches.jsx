import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getCompetitionMatches } from "../../api/footballApi";
import {
  LEAGUES,
  LIVE_STATUSES,
  FINISHED_STATUSES,
  UPCOMING_STATUSES,
  TOURNAMENT_CODES,
} from "../../utils/constants";
import MatchList from "../../components/matches/MatchList";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import Tabs from "../../components/ui/Tabs";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "finished", label: "Finished" },
  { value: "upcoming", label: "Upcoming" },
];

export default function Matches() {
  const [searchParams] = useSearchParams();
  const leagueCode = searchParams.get("league") || "";
  const league = LEAGUES.find((l) => l.code === leagueCode);
  const [statusFilter, setStatusFilter] = useState("all");

  const activeLeague = league || LEAGUES[0];
  const isTournament = TOURNAMENT_CODES.includes(activeLeague.code);

  // For regular leagues: date range. For tournaments: fetch all matches
  const filters = useMemo(() => {
    if (isTournament) return {}; // all matches for tournament
    const from = new Date();
    from.setDate(from.getDate() - 7);
    const to = new Date();
    to.setDate(to.getDate() + 14);
    const fmt = (d) => d.toISOString().split("T")[0];
    return { dateFrom: fmt(from), dateTo: fmt(to) };
  }, [isTournament]);

  const {
    data,
    loading,
    error,
    refetch,
  } = useFetch(
    (opts) => getCompetitionMatches(activeLeague.id, filters, opts),
    [activeLeague.id, isTournament],
    { autoRefresh: isTournament ? 0 : 120000 }
  );

  const matches = useMemo(() => {
    let list = data?.matches || [];

    if (statusFilter === "live") {
      list = list.filter((m) => LIVE_STATUSES.includes(m.status));
    } else if (statusFilter === "finished") {
      list = list.filter((m) => FINISHED_STATUSES.includes(m.status));
    } else if (statusFilter === "upcoming") {
      list = list.filter((m) => UPCOMING_STATUSES.includes(m.status));
    }

    return list;
  }, [data, statusFilter]);

  // Count by status for tab badges
  const counts = useMemo(() => {
    const all = data?.matches || [];
    return {
      all: all.length,
      live: all.filter((m) => LIVE_STATUSES.includes(m.status)).length,
      finished: all.filter((m) => FINISHED_STATUSES.includes(m.status)).length,
      upcoming: all.filter((m) => UPCOMING_STATUSES.includes(m.status)).length,
    };
  }, [data]);

  const tabs = STATUS_FILTERS.map((f) => ({
    ...f,
    count: counts[f.value],
  }));

  // Detect if matches have group info (for tournament view)
  const hasGroups = isTournament && matches.some((m) => m.group);

  return (
    <div>
      <PageHeader
        title="Matches"
        subtitle={`${activeLeague.flag} ${activeLeague.name} — ${isTournament ? "Tournament Schedule" : "Current Season"}`}
      >
        <button
          onClick={refetch}
          className="btn-ghost text-xs flex items-center gap-1.5"
          title="Refresh"
        >
          🔄 Refresh
        </button>
      </PageHeader>

      <div className="mb-6">
        <Tabs tabs={tabs} active={statusFilter} onChange={setStatusFilter} />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : matches.length === 0 ? (
        <EmptyState
          icon="⚽"
          title="No matches found"
          description={`No ${statusFilter !== "all" ? statusFilter : ""} matches in ${activeLeague.name}`}
        />
      ) : (
        <MatchList
          matches={matches}
          grouped
          groupByGroup={hasGroups}
          showCompetition={false}
        />
      )}
    </div>
  );
}
