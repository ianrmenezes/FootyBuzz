export default async function handler(req, res) {
  const segments = Array.isArray(req.query.path) ? req.query.path.join("/") : req.query.path || "";
  const url = new URL(req.url, `http://${req.headers.host}`);
  const apiPath = `/${segments}${url.search}`;

  // Longer cache for static-ish data, shorter for matches
  const isMatches = apiPath.includes("/matches");
  const maxAge = isMatches ? 120 : 600; // 2 min for matches, 10 min for standings/scorers/teams

  try {
    let response = await fetch(`https://api.football-data.org/v4${apiPath}`, {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_API_KEY || "",
      },
    });

    // Retry once on rate limit after a short wait
    if (response.status === 429) {
      await new Promise((r) => setTimeout(r, 6000));
      response = await fetch(`https://api.football-data.org/v4${apiPath}`, {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_API_KEY || "",
        },
      });
    }

    const contentType = response.headers.get("content-type") || "application/json";
    const body = await response.text();

    // Cache successful responses at the edge; don't cache errors
    const cacheHeader = response.ok
      ? `public, s-maxage=${maxAge}, stale-while-revalidate=600`
      : "no-store";

    res
      .status(response.status)
      .setHeader("Content-Type", contentType)
      .setHeader("Cache-Control", cacheHeader)
      .setHeader("Access-Control-Allow-Origin", "*")
      .send(body);
  } catch (err) {
    res.status(502).json({ error: "Failed to reach football-data.org" });
  }
}
