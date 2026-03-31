const API_BASE = "https://api.football-data.org/v4";
const TOKEN = process.env.FOOTBALL_API_KEY || "";

async function apiFetch(path, retries = 1) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-Auth-Token": TOKEN },
  });
  if (res.status === 429 && retries > 0) {
    // Wait and retry once on rate limit
    await new Promise((r) => setTimeout(r, 6000));
    return apiFetch(path, retries - 1);
  }
  if (!res.ok) {
    console.error(`API error: ${res.status} ${res.statusText} for ${path}`);
    return null;
  }
  return res.json();
}


export default async function handler(req, res) {
  // Use WHATWG URL API for parsing (future-proof, even if not needed now)
  // const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const league = req.query.league || "2021";
  const today = new Date();
  const past = new Date(today);
  past.setDate(today.getDate() - 3);
  const future = new Date(today);
  future.setDate(today.getDate() + 7);
  const fmt = (d) => d.toISOString().slice(0, 10);

  try {
    // Date range for league-specific matches (Matches page)
    const mFrom = new Date(today);
    mFrom.setDate(today.getDate() - 7);
    const mTo = new Date(today);
    mTo.setDate(today.getDate() + 14);

    // Fire all 4 requests in parallel — single serverless invocation
    const [matches, standings, scorers, leagueMatches] = await Promise.all([
      apiFetch(`/matches?dateFrom=${fmt(past)}&dateTo=${fmt(future)}`),
      apiFetch(`/competitions/${league}/standings`),
      apiFetch(`/competitions/${league}/scorers?limit=40`),
      apiFetch(`/competitions/${league}/matches?dateFrom=${fmt(mFrom)}&dateTo=${fmt(mTo)}`),
    ]);

    res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600")
      .json({ matches, standings, scorers, leagueMatches });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch dashboard data" });
  }
}
