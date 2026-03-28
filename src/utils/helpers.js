import { MATCH_STATUS, LIVE_STATUSES } from "./constants";

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  const days = Math.round(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return formatDate(dateStr);
}

export function getMatchStatusLabel(status) {
  const labels = {
    [MATCH_STATUS.SCHEDULED]: "Scheduled",
    [MATCH_STATUS.TIMED]: "Scheduled",
    [MATCH_STATUS.IN_PLAY]: "Live",
    [MATCH_STATUS.PAUSED]: "Half Time",
    [MATCH_STATUS.FINISHED]: "Full Time",
    [MATCH_STATUS.POSTPONED]: "Postponed",
    [MATCH_STATUS.SUSPENDED]: "Suspended",
    [MATCH_STATUS.CANCELLED]: "Cancelled",
  };
  return labels[status] || status;
}

export function isLive(status) {
  return LIVE_STATUSES.includes(status);
}

export function groupMatchesByDate(matches) {
  const groups = {};
  for (const match of matches) {
    const key = new Date(match.utcDate).toLocaleDateString("en-CA");
    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export function getScoreDisplay(match) {
  const ft = match.score?.fullTime;
  if (ft?.home != null && ft?.away != null) return `${ft.home} – ${ft.away}`;
  return "vs";
}
