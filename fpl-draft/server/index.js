const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Serve built React client
const path = require('path');
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ── Constants ──────────────────────────────────────────────────────────────
const NUM_TEAMS = 16;
const INITIAL_BUDGET = 50;
const POSITION_MAP = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };
const SQUAD_REQUIREMENTS = { GK: 2, DEF: 5, MID: 5, FWD: 3 };

// ── State ──────────────────────────────────────────────────────────────────
let players = []; // fetched from FPL API

function createInitialTeams() {
  return Array.from({ length: NUM_TEAMS }, (_, i) => ({
    id: i + 1,
    name: `Team ${i + 1}`,
    budget: INITIAL_BUDGET,
    squad: [], // { playerId, playerName, position, price }
  }));
}

let gameState = {
  teams: createInitialTeams(),
  currentAuction: null, // { player, currentBid, leadingTeamId }
  soldPlayers: [], // { player, teamId, teamName, price }
};

// ── FPL API ────────────────────────────────────────────────────────────────
async function fetchPlayers() {
  try {
    console.log('Fetching players from FPL API...');
    const res = await fetch('https://fantasy.premierleague.com/api/bootstrap-static/');
    const data = await res.json();

    const teamMap = {};
    for (const t of data.teams) {
      teamMap[t.id] = t.short_name || t.name;
    }

    players = data.elements.map((el) => ({
      id: el.id,
      web_name: el.web_name,
      first_name: el.first_name,
      second_name: el.second_name,
      element_type: el.element_type,
      position: POSITION_MAP[el.element_type] || 'UNK',
      team: el.team,
      team_name: teamMap[el.team] || 'Unknown',
    }));

    console.log(`Loaded ${players.length} players.`);
  } catch (err) {
    console.error('Failed to fetch FPL players:', err.message);
    // Fall back to empty list — admin can still manually manage
    players = [];
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function broadcastState() {
  io.emit('stateUpdate', {
    teams: gameState.teams,
    currentAuction: gameState.currentAuction,
    soldPlayers: gameState.soldPlayers,
  });
}

function getTeam(teamId) {
  return gameState.teams.find((t) => t.id === teamId);
}

// ── Socket.io ──────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send current state + player list on connect
  socket.emit('stateUpdate', {
    teams: gameState.teams,
    currentAuction: gameState.currentAuction,
    soldPlayers: gameState.soldPlayers,
  });
  socket.emit('playersLoaded', players);

  // ── startAuction ──────────────────────────────────────────────────────
  socket.on('startAuction', (playerId) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    if (gameState.currentAuction) return; // auction already running

    gameState.currentAuction = {
      player,
      currentBid: 0.25,
      leadingTeamId: null,
    };
    broadcastState();
  });

  // ── startCustomAuction ───────────────────────────────────────────────
  socket.on('startCustomAuction', ({ name, position, club }) => {
    if (gameState.currentAuction) return;
    gameState.currentAuction = {
      player: {
        id: `custom_${Date.now()}`,
        web_name: name,
        first_name: '',
        second_name: '',
        position,
        team_name: club || '—',
      },
      currentBid: 0.25,
      leadingTeamId: null,
    };
    broadcastState();
  });

  // ── setBid ────────────────────────────────────────────────────────────
  socket.on('setBid', (amount) => {
    if (!gameState.currentAuction) return;
    const rounded = Math.round(amount * 4) / 4; // snap to £0.25
    gameState.currentAuction.currentBid = Math.max(0.25, rounded);
    broadcastState();
  });

  // ── adjustBid ─────────────────────────────────────────────────────────
  socket.on('adjustBid', (delta) => {
    if (!gameState.currentAuction) return;
    const newBid = Math.round((gameState.currentAuction.currentBid + delta) * 4) / 4;
    gameState.currentAuction.currentBid = Math.max(0.25, newBid);
    broadcastState();
  });

  // ── setLeadingTeam ────────────────────────────────────────────────────
  socket.on('setLeadingTeam', (teamId) => {
    if (!gameState.currentAuction) return;
    gameState.currentAuction.leadingTeamId = teamId;
    broadcastState();
  });

  // ── confirmSale ───────────────────────────────────────────────────────
  socket.on('confirmSale', () => {
    const auction = gameState.currentAuction;
    if (!auction || !auction.leadingTeamId) return;

    const team = getTeam(auction.leadingTeamId);
    if (!team) return;

    // Deduct budget
    team.budget = Math.round((team.budget - auction.currentBid) * 100) / 100;

    // Add to squad
    team.squad.push({
      playerId: auction.player.id,
      playerName: auction.player.web_name,
      position: auction.player.position,
      price: auction.currentBid,
    });

    // Record sale
    gameState.soldPlayers.unshift({
      player: auction.player,
      teamId: team.id,
      teamName: team.name,
      price: auction.currentBid,
    });

    gameState.currentAuction = null;
    broadcastState();
  });

  // ── cancelAuction ─────────────────────────────────────────────────────
  socket.on('cancelAuction', () => {
    gameState.currentAuction = null;
    broadcastState();
  });

  // ── updateTeamName ────────────────────────────────────────────────────
  socket.on('updateTeamName', ({ teamId, name }) => {
    const team = getTeam(teamId);
    if (team) {
      team.name = name;
      // Also update any sold player records that reference this team
      for (const sp of gameState.soldPlayers) {
        if (sp.teamId === teamId) sp.teamName = name;
      }
      broadcastState();
    }
  });

  // ── resetGame ─────────────────────────────────────────────────────────
  socket.on('resetGame', () => {
    gameState = {
      teams: createInitialTeams(),
      currentAuction: null,
      soldPlayers: [],
    };
    broadcastState();
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ── REST: player search ───────────────────────────────────────────────────
app.get('/api/players', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json(players.slice(0, 50));
  const results = players
    .filter(
      (p) =>
        p.web_name.toLowerCase().includes(q) ||
        p.first_name.toLowerCase().includes(q) ||
        p.second_name.toLowerCase().includes(q)
    )
    .slice(0, 30);
  res.json(results);
});

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`FPL Draft server running on http://0.0.0.0:${PORT}`);
  await fetchPlayers();
  // Send updated player list to any already-connected clients
  io.emit('playersLoaded', players);
});
