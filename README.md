# IPL Auction Game

Friends-only IPL mega auction: live bidding, hidden ratings, instant simulated matches.

## Setup
1. Supabase dashboard -> Authentication -> Sign In / Providers -> turn ON "Allow anonymous sign-ins".
2. `cp .env.local.example .env.local`
3. `npm install && npm run dev`

## Deploy
Push to GitHub, import the repo in Vercel, add the two env vars from `.env.local.example`.

## Notes
- All rules (bids, purse, squads, XI validation, simulation) run in Postgres functions; the client only calls them.
- Player ratings live in `player_secret`, which clients cannot read.
- Add more players by inserting into `players`, `player_secret` (and `set_order` for new set codes).
