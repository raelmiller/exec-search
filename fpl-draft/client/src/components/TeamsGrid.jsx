import React, { useState } from 'react';

const SQUAD_REQS = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

const POSITION_COLOURS = {
  GK: 'bg-yellow-500 text-black',
  DEF: 'bg-blue-500 text-white',
  MID: 'bg-fpl-green text-fpl-purple',
  FWD: 'bg-red-500 text-white',
};

function budgetColour(budget) {
  if (budget > 20) return 'text-fpl-green';
  if (budget > 10) return 'text-yellow-400';
  return 'text-red-400';
}

function squadCount(squad, pos) {
  return squad.filter((p) => p.position === pos).length;
}

function TeamModal({ team, onClose }) {
  const byPosition = POSITIONS.reduce((acc, pos) => {
    acc[pos] = team.squad.filter((p) => p.position === pos);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-fpl-purple-dark border border-white/10 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-fpl-purple-dark border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-black text-white text-lg">{team.name}</h2>
            <p className={`text-sm font-bold ${budgetColour(team.budget)}`}>
              £{team.budget.toFixed(2)}m remaining · {team.squad.length}/15 players
            </p>
          </div>
          <button
            className="text-white/50 hover:text-white text-2xl leading-none ml-4"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {POSITIONS.map((pos) => (
            <div key={pos}>
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                {pos} ({byPosition[pos].length}/{SQUAD_REQS[pos]})
              </h3>
              {byPosition[pos].length === 0 ? (
                <p className="text-white/20 text-sm italic">None yet</p>
              ) : (
                <div className="space-y-1.5">
                  {byPosition[pos].map((player, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${POSITION_COLOURS[pos]}`}
                        >
                          {pos}
                        </span>
                        <p className="text-white font-semibold text-sm">{player.playerName}</p>
                      </div>
                      <span className="text-fpl-green font-black text-sm">
                        £{player.price.toFixed(2)}m
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TeamsGrid({ teams }) {
  const [selectedTeam, setSelectedTeam] = useState(null);

  return (
    <div>
      <h3 className="text-lg font-bold text-white/70 uppercase tracking-widest mb-3">Teams</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {teams.map((team) => {
          const totalPlayers = team.squad.length;
          const totalNeeded = 15;
          return (
            <button
              key={team.id}
              className="card flex flex-col gap-2 text-left w-full hover:border-fpl-green/40 transition-colors active:scale-98 touch-manipulation"
              onClick={() => setSelectedTeam(team)}
            >
              <div className="flex items-start justify-between">
                <p className="font-bold text-white text-sm leading-tight flex-1 mr-1">
                  {team.name}
                </p>
                <span className="text-xs text-white/40 flex-shrink-0">#{team.id}</span>
              </div>

              <div className={`text-xl font-black ${budgetColour(team.budget)}`}>
                £{team.budget.toFixed(2)}m
              </div>

              <div className="flex gap-1 flex-wrap">
                {POSITIONS.map((pos) => {
                  const have = squadCount(team.squad, pos);
                  const need = SQUAD_REQS[pos];
                  const full = have >= need;
                  return (
                    <span
                      key={pos}
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                        full
                          ? 'bg-fpl-green/20 text-fpl-green border border-fpl-green/30'
                          : 'bg-white/5 text-white/50 border border-white/10'
                      }`}
                    >
                      {pos} {have}/{need}
                    </span>
                  );
                })}
              </div>

              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-fpl-green rounded-full transition-all duration-500"
                  style={{ width: `${(totalPlayers / totalNeeded) * 100}%` }}
                />
              </div>
              <p className="text-xs text-white/40 text-right">{totalPlayers}/{totalNeeded} players</p>
            </button>
          );
        })}
      </div>

      {selectedTeam && (
        <TeamModal
          team={teams.find((t) => t.id === selectedTeam.id)}
          onClose={() => setSelectedTeam(null)}
        />
      )}
    </div>
  );
}
