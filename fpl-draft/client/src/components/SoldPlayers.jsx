import React from 'react';

const POSITION_COLOURS = {
  GK: 'text-yellow-400',
  DEF: 'text-blue-400',
  MID: 'text-fpl-green',
  FWD: 'text-red-400',
};

export default function SoldPlayers({ soldPlayers }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-white/70 uppercase tracking-widest mb-3">
        Sold Players ({soldPlayers.length})
      </h3>
      {soldPlayers.length === 0 ? (
        <div className="card text-center py-6">
          <p className="text-white/30">No players sold yet</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {soldPlayers.map((sale, idx) => (
            <div
              key={`${sale.player.id}-${idx}`}
              className="flex items-center justify-between bg-fpl-purple-light rounded-xl px-3 py-2.5 border border-white/5"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`text-xs font-bold w-8 flex-shrink-0 ${
                    POSITION_COLOURS[sale.player.position] || 'text-white'
                  }`}
                >
                  {sale.player.position}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">
                    {sale.player.web_name}
                  </p>
                  <p className="text-white/40 text-xs truncate">{sale.teamName}</p>
                </div>
              </div>
              <span className="text-fpl-green font-bold text-sm flex-shrink-0 ml-2">
                £{sale.price.toFixed(2)}m
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
