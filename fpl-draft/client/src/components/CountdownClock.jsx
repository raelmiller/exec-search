import React, { useState } from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${pad(s)}` : `${seconds}`;
}

function urgencyColour(remaining, duration) {
  const pct = remaining / duration;
  if (pct > 0.5) return 'text-fpl-green';
  if (pct > 0.25) return 'text-yellow-400';
  return 'text-red-400';
}

// ─── Viewer clock (read-only) ─────────────────────────────────────────────────
export function ClockDisplay({ clock }) {
  if (!clock) return null;
  const { remaining, duration, running } = clock;
  const colour = urgencyColour(remaining, duration);
  const pct = Math.max(0, remaining / duration) * 100;

  return (
    <div className="card text-center py-4">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Bid Timer</p>
      <p className={`text-6xl font-black tabular-nums ${colour} transition-colors duration-300`}>
        {formatTime(remaining)}
      </p>
      <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            pct > 50 ? 'bg-fpl-green' : pct > 25 ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!running && remaining > 0 && (
        <p className="text-white/30 text-xs mt-2">Paused</p>
      )}
      {remaining === 0 && (
        <p className="text-red-400 font-bold text-sm mt-2 animate-pulse">Time's up!</p>
      )}
    </div>
  );
}

// ─── Admin clock controls ─────────────────────────────────────────────────────
export function ClockControls({ clock, emit }) {
  const [customSeconds, setCustomSeconds] = useState('');

  if (!clock) return null;
  const { remaining, duration, running } = clock;

  const PRESETS = [30, 60, 90, 120];

  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest">Bid Timer</h3>

      <ClockDisplay clock={clock} />

      {/* Preset durations */}
      <div className="flex gap-2">
        {PRESETS.map((s) => (
          <button
            key={s}
            className={`flex-1 text-sm font-bold py-2 rounded-xl border transition-colors touch-manipulation ${
              duration === s && remaining === s && !running
                ? 'bg-fpl-green text-fpl-purple border-fpl-green'
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
            }`}
            onClick={() => emit('clockSet', s)}
          >
            {s}s
          </button>
        ))}
      </div>

      {/* Custom duration */}
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          min="5"
          className="input-field flex-1"
          placeholder="Custom (seconds)"
          value={customSeconds}
          onChange={(e) => setCustomSeconds(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customSeconds) {
              emit('clockSet', Number(customSeconds));
              setCustomSeconds('');
            }
          }}
        />
        <button
          className="bg-white/10 border border-white/20 text-white font-bold px-4 rounded-xl hover:bg-white/20 touch-manipulation"
          onClick={() => {
            if (customSeconds) {
              emit('clockSet', Number(customSeconds));
              setCustomSeconds('');
            }
          }}
        >
          Set
        </button>
      </div>

      {/* Start / Pause / Reset */}
      <div className="flex gap-2">
        <button
          className="flex-1 btn-secondary touch-manipulation"
          onClick={() => emit('clockReset')}
        >
          Reset
        </button>
        {running ? (
          <button
            className="flex-1 bg-yellow-500 text-black font-black rounded-2xl py-3 active:scale-95 transition-all touch-manipulation"
            onClick={() => emit('clockPause')}
          >
            Pause
          </button>
        ) : (
          <button
            className={`flex-1 btn-green ${remaining === 0 ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => emit('clockStart')}
          >
            {remaining === duration ? 'Start' : 'Resume'}
          </button>
        )}
      </div>
    </div>
  );
}
