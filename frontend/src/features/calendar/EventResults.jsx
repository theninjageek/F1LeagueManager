import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export const EventResults = () => {
  const { eventId } = useParams();
  const [results, setResults] = useState([]);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [session, setSession] = useState('GRAND_PRIX');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // 1. Fetch available sessions for this event
    axios.get(`${API_URL}/results/sessions/${eventId}`)
      .then(res => {
        setAvailableSessions(res.data);
        // Default to GP if it exists, otherwise the first available
        if (!res.data.includes('GRAND_PRIX')) setSession(res.data[0]);
      });
  }, [eventId]);

  useEffect(() => {
    // 2. Fetch the results for the selected session
    axios.get(`${API_URL}/results/event/${eventId}?type=${session}`)
      .then(res => setResults(res.data));
  }, [eventId, session]);

  const isQuali = session.includes('QUALIFYING');

  const getPosChange = (grid, finish) => {
    if (!grid) return '--';
    const diff = grid - finish;
    if (diff > 0) return <span className="text-green-500">▲{diff}</span>;
    if (diff < 0) return <span className="text-red-500">▼{Math.abs(diff)}</span>;
    return <span className="text-zinc-600">--</span>;
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <Link to="/calendar" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 inline-block transition-colors">
        ← Return to Calendar
      </Link>

      {/* Dynamic Session Tabs - Only shows what exists */}
      <div className="flex gap-2 mb-10 bg-zinc-900/40 p-1.5 rounded-lg border border-zinc-800 w-fit">
        {availableSessions.map(type => (
          <button key={type} onClick={() => setSession(type)}
            className={`px-6 py-2 text-[10px] font-black italic uppercase rounded ${session === type ? 'bg-f1-red text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Dynamic Table Header */}
      <div className="flex items-center px-6 py-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
        <div className="w-12">POS</div>
        <div className="flex-grow ml-12">DRIVER</div>
        {!isQuali && <div className="w-20 text-center">GRID</div>}
        {!isQuali && <div className="w-24 text-center">GAIN</div>}
        <div className="w-32 text-center">BEST LAP</div>
        {!isQuali && <div className="w-32 text-right">TIME/GAP</div>}
        {!isQuali && <div className="w-20 text-right">PTS</div>}
      </div>

      {/* Table Body */}
      <div className="mt-2 space-y-1">
        {results.map((r) => (
          <div key={r.id} className="group flex items-center bg-[#0a0a0a] h-16 border border-zinc-900 hover:border-zinc-700 transition-all">
            <div className={`w-12 flex justify-center font-black italic text-xl ${r.is_dnf ? 'text-red-900' : 'text-zinc-500'}`}>
              {r.is_dnf ? 'DNF' : r.position}
            </div>
            
            <div className="w-1 h-10 group-hover:h-full transition-all" style={{ backgroundColor: r.color_hex }} />
            
            <div className="flex-grow px-8">
              <p className="text-[10px] font-bold text-zinc-500 uppercase leading-none mb-1">{r.team_name}</p>
              <p className="font-black italic uppercase text-lg leading-none tracking-tighter">{r.driver_name}</p>
            </div>

            {!isQuali && (<div className="w-20 text-center font-bold text-zinc-500 italic">{r.calculated_grid ? `P${r.calculated_grid}` : '--'}</div>)}
            {!isQuali && (<div className="w-24 text-center text-xs font-bold">{getPosChange(r.calculated_grid, r.position)}</div>)}

            <div className="w-32 text-center">
              <p className={`font-mono text-xs ${r.fastest_lap ? 'text-purple-400 font-black shadow-[0_0_10px_purple]' : 'text-zinc-400'}`}>
                {r.best_lap_time || '--:--.---'}
              </p>
            </div>

            {!isQuali && <div className="w-32 text-right font-mono text-xs text-zinc-500 pr-4 italic">{r.total_race_time || '--'}</div>}
            {!isQuali && <div className="w-20 text-right pr-6 font-black italic text-xl text-white">{r.points_awarded > 0 ? `+${r.points_awarded}` : '0'}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};