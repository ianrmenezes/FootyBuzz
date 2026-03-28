# FootyBuzz ⚽

A soccer dashboard I built to track live scores, standings, and top scorers across major leagues. Made with React + Tailwind CSS, powered by the [football-data.org](https://www.football-data.org/) API.

**Live site:** [footybuzz.vercel.app](https://footybuzz.vercel.app)

## What it does

- Live scores with auto-refresh
- League standings (Overall / Home / Away views)
- Top scorers table with goals, assists, penalties
- Team pages with full squad and recent matches
- Favorite teams tracker (saved in browser)
- Covers 12 leagues — PL, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, etc.
- Fully responsive (works on mobile)

## Tech used

- React 18 + React Router v6
- Vite (build tool)
- Tailwind CSS
- Vercel (hosting + serverless API proxy)
- football-data.org API (free tier)

## How to run locally

```bash
# clone it
git clone https://github.com/ianrmenezes/FootyBuzz.git
cd FootyBuzz

# install dependencies
npm install

# get a free API key from https://www.football-data.org/client/register
# then create a .env file:
echo "VITE_FOOTBALL_API_KEY=your_key_here" > .env

# run it
npm run dev
```

Then open http://localhost:5173

## Project structure

```
src/
├── api/            # API calls + caching layer
├── components/
│   ├── layout/     # Sidebar, Header
│   ├── matches/    # MatchCard, MatchList
│   └── ui/         # Reusable stuff (Spinner, Tabs, Badges, etc.)
├── context/        # Favorites context (localStorage)
├── hooks/          # useFetch hook (caching, auto-refresh, abort)
├── pages/          # All the pages (Dashboard, Matches, Standings, Scorers, Team, Favorites)
└── utils/          # Constants + helper functions
api/
├── dashboard.js    # Combined endpoint (fetches everything in one call)
└── proxy.js        # Serverless proxy for production API calls
```

## How the API caching works

The free API tier only allows 10 requests/min, so I built a multi-layer cache:

1. **Vercel edge cache** — responses cached at CDN level (2-10 min depending on endpoint)
2. **localStorage cache** — browser stores responses so repeat visits are instant
3. **Stale-while-revalidate** — shows cached data immediately, updates in background
4. **Combined dashboard endpoint** — one serverless function fetches matches + standings + scorers in parallel, so the whole dashboard loads in a single request

## Deployment

Hosted on Vercel. To deploy your own:

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add `FOOTBALL_API_KEY` as an environment variable
4. Done — it deploys automatically on every push

## License

MIT
