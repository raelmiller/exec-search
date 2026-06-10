import React from 'react';

const POSITION_COLOURS = {
  GK: 'bg-yellow-500 text-black',
  DEF: 'bg-blue-500 text-white',
  MID: 'bg-fpl-green text-fpl-purple',
  FWD: 'bg-red-500 text-white',
};

export default function CurrentAuction({ currentAuction, teams }) {
  if (!currentAuction) {
    return (
      <div className="card text-center py-10">
        <p className="text-white/40 text-lg font-medium">No auction in progress</p>
        <p className="text-white/25 text-sm mt-1">Waiting for next player...</p>
      </div>
    );
  }

  const { player, currentBid, leadingTeamId } = currentAuction;
  const leadingTeam = teams.find((t) => t.id === leadingTeamId);
  const posColour = POSITION_COLOURS[player.position] || 'bg-gray-500 text-white';

  return (
    <div className="card auction-active border-fpl-green/60 border-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${posColour}`}>
              {player.position}
            </span>
            <span className="text-white/60 text-sm">{player.team_name}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
            {player.web_name}
          </h2>
          <p className="text-white/50 text-sm">
            {player.first_name} {player.second_name}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-fpl-green animate-ping" />
        </div>
      </div>

      {/* Bid amount */}
      <div className="text-center my-4">
        <p className="text-white/50 text-sm uppercase tracking-widest mb-1">Current Bid</p>
        <p className="text-5xl sm:text-6xl font-black text-fpl-green">
          £{currentBid.toFixed(2)}m
        </p>
      </div>

      {/* Leading team */}
      <div className="text-center mt-2">
        {leadingTeam ? (
          <div className="inline-flex items-center gap-2 bg-fpl-green/20 border border-fpl-green/40 rounded-full px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-fpl-green" />
            <span className="text-fpl-green font-bold">{leadingTeam.name}</span>
          </div>
        ) : (
          <span className="text-white/40 text-sm">No leading team set</span>
        )}
      </div>
    </div>
  );
}
