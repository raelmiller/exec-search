import React from 'react';
import CurrentAuction from '../components/CurrentAuction';
import TeamsGrid from '../components/TeamsGrid';
import SoldPlayers from '../components/SoldPlayers';
import { ClockDisplay } from '../components/CountdownClock';

export default function ViewerPage({ gameState, connected }) {
  const { teams, currentAuction, soldPlayers, clock } = gameState;

  return (
    <div className="min-h-screen bg-fpl-purple">
      {/* Header */}
      <header className="bg-fpl-purple-dark border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-fpl-green flex items-center justify-center">
              <span className="text-fpl-purple font-black text-sm">FPL</span>
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none">FPL Draft</h1>
              <p className="text-white/40 text-xs">Live Auction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${connected ? 'bg-fpl-green' : 'bg-red-400'}`}
            />
            <span className="text-xs text-white/50">{connected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 space-y-6">
        {/* Current Auction — prominent */}
        <section>
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">
            Current Auction
          </h2>
          <CurrentAuction currentAuction={currentAuction} teams={teams} />
        </section>

        {/* Clock */}
        {clock && (
          <section>
            <ClockDisplay clock={clock} />
          </section>
        )}

        {/* Teams Grid */}
        <section>
          <TeamsGrid teams={teams} />
        </section>

        {/* Sold Players */}
        <section>
          <SoldPlayers soldPlayers={soldPlayers} />
        </section>
      </main>
    </div>
  );
}
