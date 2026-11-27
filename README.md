# 3D IPL Auction Arena

A browser-based IPL mega-auction experience with a dark stadium-style interface, a live 3D auction stage, timed bidding, franchise ledgers, squad review, and a short tournament finish.

The repository contains two compatible layers:

1. The active Next.js application under `app/` and `components/`.
2. The complete vanilla Three.js auction-room files supplied in the design prompt under `index.html`, `js/`, `css/`, `data/`, and `script.js`.

The Next.js application is the current production entrypoint. The vanilla files are preserved as a separate browser-oriented implementation and reference implementation.

## What was completed

The original repository was inspected before changes. It contained one initial commit with auction screens and styling, but the imports and route layout were incomplete:

- Imports referenced `@/lib/*`, `@/components/*`, and `@/hooks/*` paths that were not present.
- The room route was stored under a generated filename instead of `app/room/[id]/page.js`.
- No Supabase schema or migration files were included.
- The repository had no complete working 3D auction entrypoint.

The project was rebuilt into a coherent working front end while retaining the original auction direction.

## Active application architecture

### Next.js routes

- `app/layout.js`
  - Global HTML shell.
  - Page metadata.
  - Loads the active global stylesheet.

- `app/page.js`
  - Landing page.
  - Player-name input.
  - Franchise selection for CSK, MI, RCB, KKR, DC, GT, LSG, PBKS, RR, and SRH.
  - Creates a five-character auction-room code.
  - Allows a player to join an existing browser room.
  - Stores room and player state in browser storage.
  - Navigates to `/room/[id]`.

- `app/room/[id]/page.js`
  - Dynamic room route.
  - Reads the room code from the URL.
  - Mounts the auction arena.

### Active React components

- `components/Arena.js`
  - Loads the current room and player.
  - Maintains the auction clock.
  - Advances through the player list.
  - Calculates the next legal bid.
  - Records the leading franchise.
  - Resolves sold and unsold lots.
  - Writes changes to browser storage.
  - Displays the franchise roster.
  - Displays recent sales.
  - Displays the current player, role, country, base price, bid, and leader.
  - Provides a manual “Close lot now” control.
  - Displays final squad results.
  - Starts the tournament stage.
  - Advances through simulated matches.
  - Displays the championship screen.

- `components/Stage.js`
  - React Three Fiber 3D environment.
  - Floating current-player card.
  - Raised auction platform.
  - Stage floor and lighting.
  - Spotlight over the auction area.
  - Team podiums for MI, CSK, RCB, and KKR.
  - Team-colored podium bases and flags.
  - Bidder highlighting.
  - Animated floating player display.
  - Low-power WebGL rendering configuration.
  - Shadow-enabled stage meshes and lights.

## Auction behavior

The active auction includes:

- Twenty built-in player lots.
- Player names, roles, countries, and base prices.
- Roles including batter, wicketkeeper, all-rounder, pacer, and spinner.
- A 20-second countdown per lot.
- Automatic lot resolution when the timer reaches zero.
- Manual lot resolution for testing.
- First bid starts at the player’s base price.
- Later bids increase by:
  - 5 lakh below 1 crore.
  - 10 lakh below 2 crore.
  - 25 lakh at higher values.
- A franchise cannot bid against itself while it is leading.
- Sold players are recorded with:
  - Player name.
  - Winning franchise.
  - Final price.
- Unsold players advance without entering a squad.
- The room advances automatically to the next player.
- The auction completes after the final lot.
- Recent sales are shown in reverse chronological order.

## Room and browser behavior

Room state is currently stored with browser `localStorage`:

- Room key: `ipl-room:<ROOM_CODE>`
- Player key: `ipl-player:<ROOM_CODE>`

This allows:

- Creating a room without a server.
- Reopening a room in the same browser.
- Testing a second franchise in another browser tab.
- Receiving room updates through the browser `storage` event.

The room stores:

- Room code.
- Host information.
- Room status.
- Current player index.
- Current bid.
- Current bidder.
- Sold-player ledger.
- Joined franchise names.
- Tournament round.
- Championship state.

This is intentionally a lightweight local prototype. It is not yet a production multiplayer backend.

## Tournament flow

After the auction:

1. The user reviews their franchise ledger.
2. The user starts the tournament.
3. The app presents a sequence of simulated matches.
4. The franchise advances through the bracket.
5. The final screen celebrates the champion.

The tournament stage is currently a front-end simulation. It does not yet calculate cricket scores, playing XIs, or server-side match results.

## Supabase status

The repository contains an older `supabase.js` file from the original project, but the active replacement app is not yet connected to the Supabase project named `ipl-auction-game`.

The reason is that the repository did not contain the required database schema, migrations, RPC functions, or confirmed environment configuration. The earlier code referenced functions such as:

- `create_room`
- `join_room`
- `start_auction`
- `place_bid`
- `resolve_lot`
- `start_tournament`
- `run_round`
- `submit_xi`
- `standings`

Those server-side functions are not defined in this repository. The current local-storage implementation keeps the app runnable while Supabase integration is prepared.

To make the app true multiplayer, the next Supabase step is to add and verify:

- Anonymous authentication.
- `rooms` table.
- `room_members` table.
- `players` table.
- `player_secret` table if hidden ratings are used.
- `squads` table.
- `matches` table.
- `match_xi` table.
- Row-level security policies.
- Realtime publication for room, member, squad, and match changes.
- RPC functions for room creation, joining, bidding, lot resolution, tournament setup, XI submission, round simulation, and standings.

## Prompt-supplied vanilla Three.js implementation

The requested browser-oriented files were added exactly at these paths:

### `index.html`

Includes:

- Loading screen.
- Full-screen game container.
- Overlay UI.
- Auction countdown.
- Franchise budget panels.
- Current-player display.
- Current-bid display.
- Leading-team display.
- Recently-sold list.
- Team quick-bid buttons.
- Custom bid input.
- Start-auction button.
- Player-count and sold-count summary.
- Three.js CDN.
- OrbitControls CDN.
- Script tags for the scene, auction manager, scene manager, and main script.

### `js/sceneManager.js`

Includes:

- Three.js scene creation.
- Fog and background color.
- Perspective camera.
- WebGL renderer.
- Shadow maps.
- Ambient and directional lighting.
- Four stadium spotlights.
- OrbitControls.
- Auction platform.
- Team podiums and flags.
- Auction table.
- Auction hammer.
- Simplified audience.
- Placeholder player models by role.
- Current-player placement on stage.
- Floating player animation.
- Bid particle effects.
- Sold fireworks.
- Hammer animation.
- Auction-event handling.
- Effect cleanup.
- Render loop.
- Window-resize handling.

### `js/auctionManager.js`

Includes:

- Four franchise records:
  - MI
  - CSK
  - RCB
  - KKR
- Franchise budgets.
- Franchise squad arrays.
- Player loading from `data/players.json`.
- Fallback sample players.
- Player shuffling.
- Auction start.
- Current-player state.
- Current bid.
- Active franchise.
- Bid increments.
- Budget validation.
- Countdown timer.
- Warning state for the final ten seconds.
- Sale resolution.
- Unsold resolution.
- Squad and budget updates.
- Recently-sold list.
- Custom bids.
- Quick bids.
- DOM updates.
- Auction event dispatch.
- Event listeners for all auction controls.

### `js/threeScene.js`

Retained as a compatibility shim. It explains that the active vanilla scene manager is `sceneManager.js`.

### `css/styles.css`

Includes:

- IPL franchise color variables.
- Auction-gold theme.
- Dark full-screen layout.
- Full-screen Three.js canvas.
- Loading screen.
- Loading spinner.
- Overlay UI.
- Timer and warning animation.
- Team panels.
- Franchise-specific colors.
- Player display.
- Bid display.
- Auction controls.
- Circular team bid buttons.
- Custom bid controls.
- Sold-player panel.
- Responsive layout rules.
- Pulse and spin animations.

### `data/players.json`

Includes player records with:

- ID.
- Name.
- Role.
- Speciality.
- Base price.
- Country.
- Stats.
- Image path.

The supplied dataset includes Virat Kohli, MS Dhoni, Jasprit Bumrah, AB de Villiers, and Glenn Maxwell.

### `script.js`

Includes:

- Scene-manager initialization.
- Auction-manager initialization.
- Auction-event wiring.
- Animation loop.
- Window-resize listener.
- Loading-screen fade-out.

## Styling

### Active Next.js styling

`app/globals.css` provides:

- Dark stadium-inspired background.
- Gold auction accent.
- Responsive shell layout.
- Franchise selection grid.
- Auction cards.
- Current-lot presentation.
- Countdown styling.
- Bid button styling.
- Franchise roster rows.
- Sales ledger.
- Tournament and championship presentation.
- Mobile layout rules.

### Prompt-supplied styling

`css/styles.css` is kept for the vanilla Three.js implementation and uses the supplied Rajdhani-style auction theme, franchise colors, full-screen overlays, buttons, timers, panels, loading state, and animations.

## Package and dependencies

The existing project uses:

- Next.js 14.2.15.
- React 18.3.1.
- React DOM 18.3.1.
- Three.js 0.160.x.
- React Three Fiber 8.15.x.
- Supabase JS 2.45.x.

The active 3D route uses React Three Fiber. The prompt-supplied vanilla files load Three.js and OrbitControls through CDN tags in `index.html`.

## Running the project

Install dependencies:

```bash
npm install
```

Run the Next.js application:

```bash
npm run dev
```

Open the development URL shown by Next.js, normally:

```
http://localhost:3000
```

Production build:

```bash
npm run build
```

Production server:

```bash
npm start
```

## Validation completed

The following checks have passed:

- `npm install --no-audit --no-fund`
- `npm run build`
- `node --check js/sceneManager.js`
- `node --check js/auctionManager.js`
- `node --check script.js`
- JSON parsing for `data/players.json`
- GitHub verification that all requested files were committed to `main`

The production build generated these routes:

- `/`
- `/room/[id]`
- `/_not-found`

A local production server could not be started inside the restricted validation environment because binding to port 3000 was denied. This is an environment limitation, not a build failure.

## Deployment

For the active Next.js app:

1. Push the repository to GitHub.
2. Import the repository into Vercel or another Next.js host.
3. Build with `npm run build`.
4. Start with `npm start` where applicable.
5. No Supabase environment variables are required for the current local-storage prototype.

For the future Supabase-backed version:

1. Configure the Supabase project `ipl-auction-game`.
2. Add the Supabase URL and publishable key as environment variables.
3. Apply the schema and RPC migrations.
4. Enable anonymous authentication if anonymous rooms are desired.
5. Configure row-level security and realtime.
6. Replace local-storage room writes with Supabase reads, writes, RPC calls, and subscriptions.

## Known limitations

- The active app is browser-local rather than server-backed multiplayer.
- Room codes only work where the room was created in the same browser storage context.
- Tournament matches are simulated UI progression.
- No real player images are bundled.
- No sound assets are bundled.
- The prompt-supplied vanilla files and the active Next.js app are separate entrypoints.
- The legacy Supabase RPC functions are not included in the repository.
- Next.js 14.2.15 reports a dependency security warning during installation and should be upgraded to a patched compatible release in a later maintenance pass.

## Commit history for this implementation

- `6485892` — Initial base build.
- `ddb1fd6` — Build playable 3D IPL auction arena.
- `ba028fd` — Enhance 3D auction room environment.
- `6bbe4a1` — Add requested auction room files and data.

## License

No license file is currently included.
