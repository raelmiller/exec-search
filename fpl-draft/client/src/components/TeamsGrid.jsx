import React from 'react';

const SQUAD_REQS = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

function budgetColour(budget) {
  if (budget > 20) return 'text-fpl-green';
  if (budget > 10) return 'text-yellow-400';
  return 'text-red-400';
}

function squadCount(squad, pos) {
  return squad.filter((p) => p.position === pos).length;
}

export default function TeamsGrid({ teams }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-white/70 uppercase tracking-widest mb-3">Teams</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {teams.map((team) => {
          const totalPlayers = team.squad.length;
          const totalNeeded = 15;
          return (
            <div key={team.id} className="card flex flex-col gap-2">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
