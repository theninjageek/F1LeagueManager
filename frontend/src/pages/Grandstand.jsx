import React from 'react';
import { useStandings } from '../hooks/useStandings';
import { StandingsTable } from '../features/grandstand/StandingsTable';
import { InteractiveCalendar } from '../features/grandstand/InteractiveCalendar';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;

// Helper to format date into "24 - 26 MAY" style
const formatRaceWeekend = (startDateStr) => {
  if (!startDateStr) return "TBC";
  
  const date = new Date(startDateStr);
  // F1 usually shows the Friday-Sunday range. 
  // For now, let's just show the Start Date beautifully:
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
};

export const Grandstand = () => {
  // 1. Fetch all data needed for the dashboard
  const { data: drivers } = useStandings('drivers');
  const { data: constructors } = useStandings('constructors');
  
  const { data: events } = useQuery({
    queryKey: ['calendar'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/calendar`);
      return res.data;
    }
  });

  // Find the next incomplete race for the "Upcoming" card
  const nextRace = events?.find(e => !e.is_completed) || events?.[events.length - 1];

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto pt-4">
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Public Season Grandstand</p>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">World Standings</h1>
      </header>

      {/* MAIN CONTENT GRID (Matches your Image) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Driver Standings (8 columns wide) */}
        <div className="lg:col-span-8">
          <StandingsTable data={drivers || []} title="Driver Standings" />
        </div>

        {/* RIGHT: Sidebar (4 columns wide) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Upcoming Card */}
          <div className="bg-[#111] border border-zinc-800 p-8 rounded-xl text-center relative overflow-hidden group">
            {/* Red Accent Bar at the top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-f1-red" />

            {nextRace?.track_id && (
              <img 
                src={`/assets/tracks/${nextRace.track_id}.avif`} 
                alt="" 
                className="absolute right-[-20%] top-[10%] h-[120%] opacity-10 pointer-events-none group-hover:scale-110 group-hover:opacity-20 transition-all duration-1000 grayscale invert"
              />
            )}
            
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-6">Upcoming Event</h3>
            
            <div className="space-y-1">
              <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest">Round {nextRace?.round_number}</p>
              <p className="text-f1-red text-4xl font-black italic uppercase tracking-tighter group-hover:scale-105 transition-transform duration-500">
                {nextRace?.track_name || 'Season Finished'}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-900">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Weekend Start</p>
              <p className="text-2xl font-mono font-black italic tracking-widest text-white">
                {nextRace?.weekend_start ? formatRaceWeekend(nextRace.weekend_start) : 'TBC'}
              </p>
            </div>
          </div>

          {/* Mini Constructor Standings */}
          <div className="bg-[#111] border border-zinc-800 p-6 rounded-xl">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">Constructor Standings</h3>
            {constructors?.slice(0, 11).map((team, i) => (
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
        <InteractiveCalendar events={events || []} />
      </div>
    </div>
  );
};