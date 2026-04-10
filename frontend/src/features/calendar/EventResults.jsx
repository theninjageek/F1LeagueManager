import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAvailableSessions, useEventResults, useCurrentEvent } from '../../hooks/useEventResults';
import { getPositionChange, formatLapTime } from '../../lib/formatters';
import { SESSION_TYPES, SESSION_TYPE_LABELS } from '../../constants';

export const EventResults = () => {
  const { eventId } = useParams();
  const [session, setSession] = useState(SESSION_TYPES.GRAND_PRIX);

  const { data: availableSessions = [] } = useAvailableSessions(eventId);
  const { data: results = [], isLoading } = useEventResults(eventId, session);
  const { data: currentEvent = [] } = useCurrentEvent(eventId);

  // Determine if current session is qualifying
  const isQuali = session.includes('QUALIFYING');

  const eventInfo = currentEvent[0];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <p className="text-zinc-500">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-black italic uppercase mb-8 border-l-4 border-f1-red pl-4">
        {eventInfo ? (
          <div style={{display: 'flex', gap: '10px', 'align-items': 'center'}}>
            <img 
              src={`/assets/tracks/${eventInfo.track_id}.avif`} 
              alt={eventInfo.track_name}
              //className="w-20 h-12 flex items-center justify-center bg-zinc-900/50 rounded p-1 border border-zinc-800/50 opacity-40 group-hover:opacity-100 transition-opacity grayscale invert"
              className="w-20 h-12 grayscale invert"
              onError={(e) => e.target.style.display = 'none'}
            />
            R{eventInfo.round_number} {"/"} {eventInfo.track_name} - {eventInfo.country_code} {"/"} {
              eventInfo.weekend_start 
                ? new Date(eventInfo.weekend_start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short'})
                : 'TBC'
            }
          </div>
        ) : (
          "Event Details"
        )}   
      </h2>
      <Link 
        to="/calendar" 
        className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 inline-block transition-colors"
      >
        ← Return to Calendar
      </Link>

      {/* Session Tabs */}
      <div className="flex gap-2 mb-10 bg-zinc-900/40 p-1.5 rounded-lg border border-zinc-800 w-fit">
        {availableSessions.map(type => (
          <button 
            key={type} 
            onClick={() => setSession(type)}
            className={`px-6 py-2 text-[10px] font-black italic uppercase rounded transition-colors ${
              session === type 
                ? 'bg-f1-red text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {SESSION_TYPE_LABELS[type] || type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Results Table Header */}
      <div className="flex items-center px-6 py-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
        <div className="w-12">POS</div>
        <div className="flex-grow ml-12">DRIVER</div>
        {!isQuali && <div className="w-20 text-center">GRID</div>}
        {!isQuali && <div className="w-24 text-center">GAIN</div>}
        <div className="w-32 text-center">BEST LAP</div>
        {!isQuali && <div className="w-32 text-right">TIME/GAP</div>}
        {!isQuali && <div className="w-20 text-right">PTS</div>}
      </div>

      {/* Results Table Body */}
      <div className="mt-2 space-y-1">
        {results.map((result) => {
          const posChange = getPositionChange(result.calculated_grid, result.position);
          
          return (
            <div 
              key={result.id} 
              className="group flex items-center bg-[#0a0a0a] h-16 border border-zinc-900 hover:border-zinc-700 transition-all"
            >
              <div className={`w-12 flex justify-center font-black italic text-xl ${
                result.is_dnf ? 'text-red-900' : 'text-zinc-500'
              }`}>
                {result.is_dnf ? 'DNF' : result.position}
              </div>
              
              <div 
                className="w-1 h-10 group-hover:h-full transition-all" 
                style={{ backgroundColor: result.color_hex }} 
              />
              
              <div className="flex-grow px-8">
                <p className="text-[10px] font-bold text-zinc-500 uppercase leading-none mb-1">
                  {result.team_name}
                </p>
                <p className="font-black italic uppercase text-lg leading-none tracking-tighter">
                  {result.driver_name}
                </p>
              </div>

              {!isQuali && (
                <div className="w-20 text-center font-bold text-zinc-500 italic">
                  {result.calculated_grid ? `P${result.calculated_grid}` : '--'}
                </div>
              )}
              
              {!isQuali && (
                <div className={`w-24 text-center text-xs font-bold ${posChange.color}`}>
                  {posChange.label}
                </div>
              )}

              <div className="w-32 text-center">
                <p className={`font-mono text-xs ${
                  result.fastest_lap 
                    ? 'text-purple-400 font-black shadow-[0_0_10px_purple]' 
                    : 'text-zinc-400'
                }`}>
                  {formatLapTime(result.best_lap_time)}
                </p>
              </div>

              {!isQuali && (
                <div className="w-32 text-right font-mono text-xs text-zinc-500 pr-4 italic">
                  {result.total_race_time || '--'}
                </div>
              )}
              
              {!isQuali && (
                <div className="w-20 text-right pr-6 font-black italic text-xl text-white">
                  {result.points_awarded > 0 ? `+${result.points_awarded}` : '0'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};