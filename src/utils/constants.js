export const LEAGUES = [
  { code: "PL", id: 2021, name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "PD", id: 2014, name: "La Liga", country: "Spain", flag: "🇪🇸" },
  { code: "SA", id: 2019, name: "Serie A", country: "Italy", flag: "🇮🇹" },
  { code: "BL1", id: 2002, name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  { code: "FL1", id: 2015, name: "Ligue 1", country: "France", flag: "🇫🇷" },
  { code: "CL", id: 2001, name: "Champions League", country: "Europe", flag: "🏆" },
  { code: "ELC", id: 2016, name: "Championship", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "DED", id: 2003, name: "Eredivisie", country: "Netherlands", flag: "🇳🇱" },
  { code: "PPL", id: 2017, name: "Primeira Liga", country: "Portugal", flag: "🇵🇹" },
  { code: "BSA", id: 2013, name: "Série A", country: "Brazil", flag: "🇧🇷" },
  { code: "WC", id: 2000, name: "World Cup", country: "World", flag: "🌍" },
  { code: "EC", id: 2018, name: "European Championship", country: "Europe", flag: "🇪🇺" },
];

export const DEFAULT_LEAGUE = LEAGUES[0];

export const MATCH_STATUS = {
  SCHEDULED: "SCHEDULED",
  TIMED: "TIMED",
  IN_PLAY: "IN_PLAY",
  PAUSED: "PAUSED",
  FINISHED: "FINISHED",
  POSTPONED: "POSTPONED",
  SUSPENDED: "SUSPENDED",
  CANCELLED: "CANCELLED",
};

export const LIVE_STATUSES = [MATCH_STATUS.IN_PLAY, MATCH_STATUS.PAUSED];
export const FINISHED_STATUSES = [MATCH_STATUS.FINISHED];
export const UPCOMING_STATUSES = [MATCH_STATUS.SCHEDULED, MATCH_STATUS.TIMED];

// Tournament competitions that should show full schedule (not date-range filtered)
export const TOURNAMENT_CODES = ["WC", "EC"];
