import React from 'react';
import { useStandings, useCalendar } from '../hooks';
import { StandingsTable } from '../features/grandstand/StandingsTable';
import { InteractiveCalendar } from '../features/grandstand/InteractiveCalendar';
import { formatRaceWeekend } from '../lib/formatters';

export const Grandstand = () => {
  const { data: drivers = [] } = useStandings('drivers');
  const { data: constructors = [] } = useStandings('constructors');
  const { data: events = [] } = useCalendar();

  // Find next incomplete race
  const nextRace = events.find(e => !e.is_completed) || events[events.length - 1];

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto pt-4">
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Public Season Grandstand</p>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">World Standings</h1>
      </header>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Driver Standings */}
        <div className="lg:col-span-8">
          <StandingsTable data={drivers} title="Driver Standings" />
        </div>

        {/* RIGHT: Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Upcoming Event Card */}
          <div className="bg-[#111] border border-zinc-800 p-8 rounded-xl text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-f1-red" />

            {nextRace?.track_id && (
              <img 
                src={`/assets/tracks/${nextRace.track_id}.avif`} 
                alt="Track" 
                className="absolute right-[-20%] top-[10%] h-[120%] opacity-10 pointer-events-none group-hover:scale-110 group-hover:opacity-20 transition-all duration-1000 grayscale invert"
              />
            )}
            
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-6">Upcoming Event</h3>
            
            <div className="space-y-1">
              <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">
                Round {nextRace?.round_number || 'N/A'}
              </p>
              <p className="text-f1-red text-4xl font-black italic uppercase tracking-tighter group-hover:scale-105 transition-transform duration-500">
                {nextRace?.track_name || 'Season Finished'}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Weekend Start</p>
              <p className="text-2xl font-mono font-black italic tracking-widest text-white">
                {formatRaceWeekend(nextRace?.weekend_start)}
              </p>
            </div>
          </div>

          {/* Constructor Standings */}
          <div className="bg-[#111] border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Constructor Standings</h3>
            {constructors.slice(0, 11).map((team) => (
              <div key={team.name} className="flex justify-between items-center py-2 border-b border-zinc-900 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-3" style={{ backgroundColor: team.color_hex }} />
                  <span className="text-xs font-bold uppercase italic">{team.name}</span>
                </div>
                <span className="font-black italic">{team.total_points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM: Interactive Calendar */}
      <div className="max-w-7xl mx-auto">
        <InteractiveCalendar events={events} />
      </div>
    </div>
  );
};