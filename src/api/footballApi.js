const API_BASE = "/api";

// ── Persistent cache: survives page reloads via localStorage ──
const STORAGE_KEY = "footybuzz-cache";
const FRESH_TTL = 10 * 60_000; // 10 min
const STALE_TTL = 24 * 60 * 60_000; // 24 hours

const cache = new Map();

try {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const now = Date.now();
  for (const [key, entry] of Object.entries(stored)) {
    if (now - entry.time < STALE_TTL) cache.set(key, entry);
  }
} catch {}

function persistCache() {
  try {
    const obj = {};
    for (const [key, entry] of cache) obj[key] = entry;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => { saveTimer = null; persistCache(); }, 2000);
}

// ── Token-bucket rate limiter ──
const RATE_LIMIT = 9;
const WINDOW = 60_000;
const timestamps = [];

function canRequest() {
  const now = Date.now();
  while (timestamps.length && timestamps[0] <= now - WINDOW) timestamps.shift();
  return timestamps.length < RATE_LIMIT;
}

// ── In-flight deduplication ──
const inflight = new Map();

function networkFetch(endpoint) {
  if (inflight.has(endpoint)) return inflight.get(endpoint);

  const p = fetch(`${API_BASE}${endpoint}`)
    .then(async (res) => {
      if (res.status === 429) {
        // Back off: pretend we used all our budget so new requests wait
        const now = Date.now();
        timestamps.length = 0;
        for (let i = 0; i < RATE_LIMIT; i++) timestamps.push(now);
        throw new Error("Rate limited — please wait a moment.");
      }
      if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
      const data = await res.json();
      cache.set(endpoint, { data, time: Date.now() });
      scheduleSave();
      return data;
    })
    .finally(() => inflight.delete(endpoint));

  inflight.set(endpoint, p);
  return p;
}

// ── Synchronous cache peek (lets useFetch render cached data on first frame) ──
let _peekResult;
export function _consumePeek() {
  const r = _peekResult;
  _peekResult = undefined;
  return r;
}

async function request(endpoint, { signal, _peek } = {}) {
  if (_peek) {
    const cached = cache.get(endpoint);
    _peekResult = cached?.data;
    return _peekResult;
  }

  const cached = cache.get(endpoint);

  // 1. Fresh cache → instant
  if (cached && Date.now() - cached.time < FRESH_TTL) {
    return cached.data;
  }

  // 2. Stale cache → return stale instantly, revalidate in background
  if (cached) {
    if (!inflight.has(endpoint) && canRequest()) {
      timestamps.push(Date.now());
      networkFetch(endpoint).catch(() => {});
    }
    return cached.data;
  }

  // 3. Already in-flight (e.g. prefetch started it) → piggyback
  if (inflight.has(endpoint)) {
    if (signal) {
      return new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        inflight.get(endpoint).then(resolve, reject);
      });
    }
    return inflight.get(endpoint);
  }

  // 4. Cold miss → wait for rate limit budget if needed
  if (!canRequest()) {
    const waitTime = timestamps[0] + WINDOW - Date.now() + 100;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, waitTime);
      if (signal) {
        signal.addEventListener("abort", () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        });
      }
    });
  }

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  timestamps.push(Date.now());
  return networkFetch(endpoint);
}

// Prefetch removed — Dashboard fetches these on mount.
// On cold loads the prefetch doubled requests and triggered 429 rate limits.

// ── Public API ──

// Inject data into cache under a given key so other pages get instant hits
function seedCache(endpoint, data) {
  if (data) {
    cache.set(endpoint, { data, time: Date.now() });
    scheduleSave();
  }
}

export async function getDashboardData(leagueId, opts) {
  const result = await request(`/dashboard?league=${leagueId}`, opts);

  // Seed individual caches so Standings, Scorers, Matches pages are instant
  if (result) {
    seedCache(`/competitions/${leagueId}/standings`, result.standings);
    seedCache(`/competitions/${leagueId}/scorers?limit=40`, result.scorers);
    if (result.matches) {
      // Reconstruct the same date-range key that getRecentAndUpcoming uses
      const today = new Date();
      const past = new Date(today);
      past.setDate(today.getDate() - 3);
      const future = new Date(today);
      future.setDate(today.getDate() + 7);
      const fmt = (d) => d.toISOString().slice(0, 10);
      seedCache(`/matches?dateFrom=${fmt(past)}&dateTo=${fmt(future)}`, result.matches);
    }
    if (result.leagueMatches) {
      // Seed the Matches page cache key
      const today = new Date();
      const mFrom = new Date(today);
      mFrom.setDate(today.getDate() - 7);
      const mTo = new Date(today);
      mTo.setDate(today.getDate() + 14);
      const fmt = (d) => d.toISOString().slice(0, 10);
      seedCache(`/competitions/${leagueId}/matches?dateFrom=${fmt(mFrom)}&dateTo=${fmt(mTo)}`, result.leagueMatches);
    }
  }
  return result;
}

export function getCompetitions(opts) {
  return request("/competitions", opts);
}

export function getCompetition(id, opts) {
  return request(`/competitions/${id}`, opts);
}

export function getTodayMatches(opts) {
  return request("/matches", opts);
}

export function getRecentAndUpcoming(opts) {
  const today = new Date();
  const past = new Date(today);
  past.setDate(today.getDate() - 3);
  const future = new Date(today);
  future.setDate(today.getDate() + 7);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return request(`/matches?dateFrom=${fmt(past)}&dateTo=${fmt(future)}`, opts);
}

export function getCompetitionMatches(competitionId, filters = {}, opts) {
  const params = new URLSearchParams(filters).toString();
  const qs = params ? `?${params}` : "";
  return request(`/competitions/${competitionId}/matches${qs}`, opts);
}

export function getStandings(competitionId, opts) {
  return request(`/competitions/${competitionId}/standings`, opts);
}

export function getScorers(competitionId, limit = 20, opts) {
  return request(`/competitions/${competitionId}/scorers?limit=${limit}`, opts);
}

export function getCompetitionTeams(competitionId, opts) {
  return request(`/competitions/${competitionId}/teams`, opts);
}

export function getTeam(teamId, opts) {
  return request(`/teams/${teamId}`, opts);
}

export function getTeamMatches(teamId, filters = {}, opts) {
  const params = new URLSearchParams(filters).toString();
  const qs = params ? `?${params}` : "";
  return request(`/teams/${teamId}/matches${qs}`, opts);
}
