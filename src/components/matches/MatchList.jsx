import MatchCard from "./MatchCard";
import { formatRelativeDate, formatDate } from "../../utils/helpers";

function prettifyGroup(group) {
  if (!group) return "Other";
  // "GROUP_A" → "Group A"
  return group.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace("Group ", "Group ");
}

export default function MatchList({
  matches,
  grouped = false,
  groupByGroup = false,
  showCompetition = false,
}) {
  if (!grouped && !groupByGroup) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} showCompetition={showCompetition} />
        ))}
      </div>
    );
  }

  // Tournament view: group by group (GROUP_A, etc.), then by date within each group
  if (groupByGroup) {
    const groupMap = {};
    for (const m of matches) {
      const grp = m.group || m.stage || "OTHER";
      if (!groupMap[grp]) groupMap[grp] = [];
      groupMap[grp].push(m);
    }

    // Sort groups alphabetically
    const sortedGroups = Object.entries(groupMap).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    return (
      <div className="space-y-8">
        {sortedGroups.map(([group, groupMatches]) => {
          // Sub-group by date within each group
          const byDate = {};
          for (const m of groupMatches) {
            const key = new Date(m.utcDate).toLocaleDateString("en-CA");
            if (!byDate[key]) byDate[key] = [];
            byDate[key].push(m);
          }
          const sortedDates = Object.entries(byDate).sort(([a], [b]) =>
            a.localeCompare(b)
          );

          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-[13px] font-bold text-gray-900 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg">
                  {prettifyGroup(group)}
                </h3>
                <span className="text-[11px] text-gray-400">
                  {groupMatches.length} match{groupMatches.length !== 1 && "es"}
                </span>
              </div>
              <div className="space-y-5 pl-1">
                {sortedDates.map(([date, dayMatches]) => (
                  <div key={date}>
                    <p className="text-[11px] font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      {formatRelativeDate(date)}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {dayMatches.map((m) => (
                        <MatchCard
                          key={m.id}
                          match={m}
                          showCompetition={showCompetition}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Default: group by date
  const groups = {};
  for (const m of matches) {
    const key = new Date(m.utcDate).toLocaleDateString("en-CA");
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }


  // Sort dates descending if all matches are finished, else ascending
  let sorted = Object.entries(groups);
  if (matches.length > 0 && matches.every((m) => m.status === "FINISHED")) {
    sorted = sorted.sort(([a], [b]) => b.localeCompare(a)); // latest date first
  } else {
    sorted = sorted.sort(([a], [b]) => a.localeCompare(b));
  }

  return (
    <div className="space-y-8">
      {sorted.map(([date, dayMatches]) => (
        <div key={date}>
          <h3 className="text-[13px] font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            {formatRelativeDate(date)}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {dayMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                showCompetition={showCompetition}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
