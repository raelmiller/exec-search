# FPL Draft Auction App

Real-time auction app for an in-person Fantasy Premier League draft. One person runs the server; everyone else connects via phone browsers on the same WiFi network.

## Quick Start

### 1. Install dependencies

```bash
cd fpl-draft
npm install          # installs server deps + concurrently
cd client && npm install  # installs React/Vite deps
cd ..
```

Or use the convenience script:
```bash
npm run install:all
```

### 2. Run the app

```bash
npm run dev
```

This starts:
- **Server** on `http://0.0.0.0:3001` (fetches FPL player data on boot)
- **Client** on `http://0.0.0.0:5173`

### 3. Share with participants

Find your laptop's local IP address:
- **Mac**: `ipconfig getifaddr en0`
- **Windows**: `ipconfig` → look for IPv4 Address
- **Linux**: `ip addr show`

Share these URLs over the room:
- **Everyone (viewers)**: `http://YOUR_IP:5173/`
- **Auctioneer only**: `http://YOUR_IP:5173/admin` (PIN: `fpl2025`)

---

## Roles

### Viewer (`/`)
- Read-only live view
- Shows current auction (player, bid, leading team)
- Shows all 16 team budgets and squad progress
- Shows sold players list

### Admin (`/admin`)
- PIN protected (`fpl2025`)
- Search players and start auctions
- Adjust bids in £0.25m increments
- Set the leading team
- Confirm or cancel sales
- Edit team names
- Reset the entire game

---

## Game Rules

| Rule | Value |
|------|-------|
| Teams | 16 |
| Starting budget | £50m |
| Squad size | 15 players |
| GK | 2 |
| DEF | 5 |
| MID | 5 |
| FWD | 3 |
| Min bid | £0.25m |
| Bid increment | £0.25m |

---

## Architecture

```
fpl-draft/
├── package.json          # root: concurrently scripts
├── server/
│   └── index.js          # Express + Socket.io server
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── hooks/
        │   └── useSocket.js
        ├── pages/
        │   ├── ViewerPage.jsx
        │   └── AdminPage.jsx
        └── components/
            ├── CurrentAuction.jsx
            ├── TeamsGrid.jsx
            └── SoldPlayers.jsx
```

---

## Troubleshooting

**Players not loading?** The server fetches from `https://fantasy.premierleague.com/api/bootstrap-static/` on startup. If it fails (no internet, FPL API down), the player list will be empty but the rest of the app still works.

**Can't connect from phone?** Make sure all devices are on the same WiFi network. Firewall may need to allow ports 3001 and 5173.

**Wrong IP?** The client automatically uses `window.location.hostname` to find the server, so it works on any local IP without configuration.
