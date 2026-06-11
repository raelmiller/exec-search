import React, { useState, useMemo } from 'react';
import CurrentAuction from '../components/CurrentAuction.jsx';
import SoldPlayers from '../components/SoldPlayers.jsx';
import { ClockControls } from '../components/CountdownClock.jsx';
import * as XLSX from 'xlsx';

function exportToExcel(soldPlayers, teams) {
  // Sheet 1: Sold players
  const soldRows = soldPlayers.map((s) => ({
    Player: s.player.web_name,
    Position: s.player.position,
    Club: s.player.team_name,
    'Bought By': s.teamName,
    'Price (£m)': s.price,
  }));

  // Sheet 2: Team summaries
  const teamRows = teams.flatMap((t) =>
    t.squad.length === 0
      ? [{ Team: t.name, Player: '—', Position: '—', 'Price (£m)': '—', 'Budget Remaining (£m)': t.budget }]
      : t.squad.map((p, i) => ({
          Team: i === 0 ? t.name : '',
          Player: p.playerName,
          Position: p.position,
          'Price (£m)': p.price,
          'Budget Remaining (£m)': i === 0 ? t.budget : '',
        }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(soldRows), 'All Sales');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamRows), 'By Team');
  XLSX.writeFile(wb, 'fpl-draft-results.xlsx');
}

const ADMIN_PIN = '2025';

const POSITION_COLOURS = {
  GK: 'bg-yellow-500 text-black',
  DEF: 'bg-blue-500 text-white',
  MID: 'bg-fpl-green text-fpl-purple',
  FWD: 'bg-red-500 text-white',
};

const SQUAD_REQS = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

function squadCount(squad, pos) {
  return squad.filter((p) => p.position === pos).length;
}

function budgetColour(budget) {
  if (budget > 20) return 'text-fpl-green';
  if (budget > 10) return 'text-yellow-400';
  return 'text-red-400';
}

// ─── PIN Screen ───────────────────────────────────────────────────────────────
function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-fpl-purple flex items-center justify-center px-4">
      <div className="card w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-fpl-green flex items-center justify-center mx-auto mb-4">
          <span className="text-fpl-purple font-black text-2xl">🔒</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Admin Access</h1>
        <p className="text-white/50 text-sm mb-6">Enter PIN to continue</p>
        <input
          type="password"
          inputMode="numeric"
          className={`input-field text-center text-xl tracking-widest mb-4 ${
            error ? 'border-red-500' : ''
          }`}
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
        />
        {error && <p className="text-red-400 text-sm mb-3">Incorrect PIN</p>}
        <button className="btn-green w-full text-lg" onClick={submit}>
          Unlock
        </button>
      </div>
    </div>
  );
}

// ─── Player Search Panel ──────────────────────────────────────────────────────
function PlayerSearch({ players, onSelect, onSelectCustom }) {
  const [query, setQuery] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPos, setCustomPos] = useState('FWD');
  const [customClub, setCustomClub] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return players
      .filter(
        (p) =>
          p.web_name.toLowerCase().includes(q) ||
          p.first_name.toLowerCase().includes(q) ||
          p.second_name.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [query, players]);

  const submitCustom = () => {
    if (!customName.trim()) return;
    onSelectCustom({ name: customName.trim(), position: customPos, club: customClub.trim() || '—' });
    setCustomName('');
    setCustomClub('');
    setShowCustom(false);
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">
        Start Auction — Search Player
      </h3>

      {!showCustom ? (
        <>
          <input
            type="text"
            className="input-field mb-2"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {filtered.length > 0 && (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  className="w-full flex items-center gap-3 bg-fpl-purple-dark hover:bg-fpl-purple-light border border-white/10 rounded-xl px-3 py-2.5 text-left transition-colors active:scale-98 touch-manipulation"
                  onClick={() => {
                    onSelect(p.id);
                    setQuery('');
                  }}
                >
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      POSITION_COLOURS[p.position] || 'bg-gray-500 text-white'
                    }`}
                  >
                    {p.position}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{p.web_name}</p>
                    <p className="text-white/40 text-xs truncate">
                      {p.first_name} {p.second_name} · {p.team_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {query.trim() && filtered.length === 0 && (
            <p className="text-white/30 text-sm text-center py-3">No players found</p>
          )}
          <button
            className="mt-3 w-full text-sm text-white/40 border border-white/10 rounded-xl py-2.5 hover:bg-white/5 transition-colors"
            onClick={() => setShowCustom(true)}
          >
            + Add custom player (not in FPL)
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            className="input-field"
            placeholder="Player name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCustom()}
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Club (optional)"
              value={customClub}
              onChange={(e) => setCustomClub(e.target.value)}
            />
            <select
              className="input-field w-28 flex-shrink-0"
              value={customPos}
              onChange={(e) => setCustomPos(e.target.value)}
            >
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="MID">MID</option>
              <option value="FWD">FWD</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-white/10 text-white/70 rounded-xl py-2.5 text-sm"
              onClick={() => setShowCustom(false)}
            >
              Cancel
            </button>
            <button
              className={`flex-1 btn-green ${!customName.trim() ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={submitCustom}
            >
              Start Auction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Auction Controls ─────────────────────────────────────────────────────────
function AuctionControls({ auction, teams, emit }) {
  const [typedBid, setTypedBid] = useState('');

  if (!auction) return null;
  const { player, currentBid, leadingTeamId } = auction;

  const applyTypedBid = () => {
    const val = parseFloat(typedBid);
    if (!isNaN(val) && val >= 0.25) {
      // Round to nearest 0.25
      const rounded = Math.round(val / 0.25) * 0.25;
      emit('setBid', rounded);
      setTypedBid('');
    }
  };

  return (
    <div className="card border-fpl-green/50 border-2 space-y-4">
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            POSITION_COLOURS[player.position] || 'bg-gray-500 text-white'
          }`}
        >
          {player.position}
        </span>
        <div>
          <p className="font-black text-white text-lg leading-tight">{player.web_name}</p>
          <p className="text-white/50 text-xs">{player.team_name}</p>
        </div>
        <div className="ml-auto w-2.5 h-2.5 rounded-full bg-fpl-green animate-ping flex-shrink-0" />
      </div>

      {/* Bid display + adjust */}
      <div className="text-center">
        <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Current Bid</p>
        <p className="text-5xl font-black text-fpl-green">£{currentBid.toFixed(2)}m</p>
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 bg-fpl-purple-dark border border-white/20 text-white font-black text-2xl rounded-2xl py-4 active:scale-95 transition-all touch-manipulation"
          onClick={() => emit('adjustBid', -0.25)}
        >
          −£0.25
        </button>
        <button
          className="flex-1 bg-fpl-green text-fpl-purple font-black text-2xl rounded-2xl py-4 active:scale-95 transition-all touch-manipulation"
          onClick={() => emit('adjustBid', 0.25)}
        >
          +£0.25
        </button>
      </div>

      {/* Typed bid input */}
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.25"
          min="0.25"
          className="input-field flex-1"
          placeholder="Type bid (e.g. 8.50)"
          value={typedBid}
          onChange={(e) => setTypedBid(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyTypedBid()}
        />
        <button
          className="bg-white/10 border border-white/20 text-white font-bold px-4 rounded-xl hover:bg-white/20 active:scale-95 transition-all touch-manipulation"
          onClick={applyTypedBid}
        >
          Set
        </button>
      </div>

      {/* Leading team selector */}
      <div>
        <label className="text-white/50 text-xs uppercase tracking-widest block mb-2">
          Leading Team
        </label>
        <div className="grid grid-cols-2 gap-2">
          {teams.map((t) => {
            const selected = t.id === leadingTeamId;
            return (
              <button
                key={t.id}
                className={`text-left px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all active:scale-95 touch-manipulation ${
                  selected
                    ? 'bg-fpl-green text-fpl-purple border-fpl-green'
                    : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                }`}
                onClick={() => emit('setLeadingTeam', selected ? null : t.id)}
              >
                <p className="truncate">{t.name}</p>
                <p className={`text-xs font-normal ${selected ? 'text-fpl-purple/70' : 'text-white/40'}`}>
                  £{t.budget.toFixed(2)}m
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirm / Cancel */}
      <div className="flex gap-3">
        <button
          className="flex-1 btn-red"
          onClick={() => emit('cancelAuction')}
        >
          Cancel
        </button>
        <button
          className={`flex-1 btn-green ${!leadingTeamId ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => emit('confirmSale')}
        >
          Confirm Sale ✓
        </button>
      </div>
    </div>
  );
}

// ─── Team Management ──────────────────────────────────────────────────────────
function TeamManagement({ teams, emit }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startEdit = (team) => {
    setEditingId(team.id);
    setEditName(team.name);
  };

  const saveEdit = (teamId) => {
    if (editName.trim()) {
      emit('updateTeamName', { teamId, name: editName.trim() });
    }
    setEditingId(null);
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">
        Team Management
      </h3>
      <div className="space-y-2">
        {teams.map((team) => {
          const isEditing = editingId === team.id;
          return (
            <div
              key={team.id}
              className="card flex items-center gap-3 py-3"
            >
              <span className="text-white/30 text-xs w-5 text-right flex-shrink-0">
                {team.id}
              </span>
              {isEditing ? (
                <input
                  className="input-field flex-1 py-2 text-sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(team.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  autoFocus
                />
              ) : (
                <span className="flex-1 font-semibold text-white text-sm">{team.name}</span>
              )}
              <div className="flex-shrink-0">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      className="text-xs bg-fpl-green text-fpl-purple font-bold px-3 py-1.5 rounded-lg"
                      onClick={() => saveEdit(team.id)}
                    >
                      Save
                    </button>
                    <button
                      className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="text-xs bg-white/10 text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/20"
                    onClick={() => startEdit(team)}
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className={`text-sm font-bold ${budgetColour(team.budget)}`}>
                  £{team.budget.toFixed(2)}m
                </p>
                <p className="text-white/30 text-xs">{team.squad.length}/15</p>
              </div>
              {/* Squad slots */}
              <div className="hidden sm:flex gap-1 flex-shrink-0">
                {POSITIONS.map((pos) => {
                  const have = squadCount(team.squad, pos);
                  const need = SQUAD_REQS[pos];
                  const full = have >= need;
                  return (
                    <span
                      key={pos}
                      className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                        full
                          ? 'bg-fpl-green/20 text-fpl-green'
                          : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {pos[0]}{have}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage({ gameState, players, connected, emit }) {
  const [unlocked, setUnlocked] = useState(false);
  const [showReset, setShowReset] = useState(false);

  if (!unlocked) {
    return <PinScreen onUnlock={() => setUnlocked(true)} />;
  }

  const { teams, currentAuction, soldPlayers, clock } = gameState;

  return (
    <div className="min-h-screen bg-fpl-purple">
      {/* Header */}
      <header className="bg-fpl-purple-dark border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-fpl-green flex items-center justify-center">
              <span className="text-fpl-purple font-black text-sm">FPL</span>
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none">Admin</h1>
              <p className="text-white/40 text-xs">Auctioneer Controls</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${connected ? 'bg-fpl-green' : 'bg-red-400'}`}
            />
            <span className="text-xs text-white/50">{connected ? 'Live' : 'Disconnected'}</span>
            <button
              className="text-xs bg-red-900/50 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg"
              onClick={() => setShowReset(true)}
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Reset confirmation modal */}
      {showReset && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
          <div className="card max-w-sm w-full text-center">
            <p className="text-xl font-black text-white mb-2">Reset Game?</p>
            <p className="text-white/50 text-sm mb-5">
              This will clear all teams, budgets, squads and sales. Cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 btn-secondary"
                onClick={() => setShowReset(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 btn-red"
                onClick={() => {
                  emit('resetGame');
                  setShowReset(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-6">
        {/* Auction Controls or Player Search */}
        {currentAuction ? (
          <section>
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">
              Active Auction
            </h2>
            <AuctionControls auction={currentAuction} teams={teams} emit={emit} />
          </section>
        ) : (
          <section className="card">
            <PlayerSearch
            players={players}
            onSelect={(id) => emit('startAuction', id)}
            onSelectCustom={(custom) => emit('startCustomAuction', custom)}
          />
          </section>
        )}

        {/* Live auction viewer (read-only summary) */}
        {!currentAuction && (
          <section>
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">
              Auction Status
            </h2>
            <CurrentAuction currentAuction={null} teams={teams} />
          </section>
        )}

        {/* Countdown Clock */}
        <section>
          <ClockControls clock={clock} emit={emit} />
        </section>

        {/* Team Management */}
        <section>
          <TeamManagement teams={teams} emit={emit} />
        </section>

        {/* Sold Players */}
        <section>
          <SoldPlayers soldPlayers={soldPlayers} />
        </section>

        {/* Export */}
        {soldPlayers.length > 0 && (
          <section className="pb-8">
            <button
              className="w-full btn-green py-4 text-lg"
              onClick={() => exportToExcel(soldPlayers, teams)}
            >
              Export to Excel
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
