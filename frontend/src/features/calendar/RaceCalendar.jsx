import React from 'react';
import { Link } from 'react-router-dom';
import { useCalendar } from '../../hooks';

export const RaceCalendar = () => {
  const { data: events = [], isLoading } = useCalendar();

  const formatDate = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <p className="text-zinc-500">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-black italic uppercase mb-8 border-l-4 border-f1-red pl-4">
        Season Calendar
      </h2>
      
      <div className="space-y-4">
        {events.map((event) => (
          <Link 
            key={event.id} 
            to={event.is_completed ? `/results/${event.id}` : '#'}
            className={`group relative flex items-center bg-[#111] p-4 transition-all border-l-2 no-underline
              ${event.is_completed 
                ? 'border-zinc-700 opacity-80 hover:opacity-100 hover:border-f1-red hover:bg-[#151515] cursor-pointer' 
                : 'border-f1-red shadow-[0_0_15px_rgba(225,6,0,0.1)] cursor-default'
              }`}
          >
            {/* Round Number */}
            <div className="w-16 text-center">
              <p className="text-[10px] uppercase text-zinc-500 font-bold">RND</p>
              <p className="text-2xl font-black italic group-hover:text-f1-red transition-colors">
                {event.round_number}
              </p>
            </div>

            {/* Track Thumbnail */}
            <div className="w-20 h-12 ml-4 flex items-center justify-center bg-zinc-900/50 rounded p-1 border border-zinc-800/50">
              <img 
                src={`/assets/tracks/${event.track_id}.avif`} 
                alt={event.track_name}
                className="max-h-full max-w-full object-contain opacity-40 group-hover:opacity-100 transition-opacity grayscale invert"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>

            {/* Track Info */}
            <div className="flex-grow ml-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold uppercase tracking-tight text-white">{event.track_name}</h3>
                {event.is_reverse && (
                  <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-sm italic uppercase">
                    Reverse
                  </span>
                )}
                {event.has_sprint && (
                  <span className="bg-red-500 text-black text-[10px] font-black px-2 py-0.5 rounded-sm italic uppercase">
                    Sprint
                  </span>
                )}
                {event.is_street_circuit && (
                  <span className="border border-zinc-700 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                    Street
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">
                Session Date: {formatDate(event.weekend_start)}
              </p>
            </div>

            {/* Status Badge */}
            <div className="pr-4">
              {event.is_completed ? (
                <div className="flex flex-col items-end">
                  <span className="text-zinc-600 font-black italic text-sm group-hover:text-white transition-colors">
                    COMPLETE
                  </span>
                  <span className="text-[10px] text-f1-red font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    RESULTS →
                  </span>
                </div>
              ) : (
                <span className="text-f1-red font-black italic text-sm animate-pulse">
                  UPCOMING
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};