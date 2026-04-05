import React from 'react';

export const InteractiveCalendar = ({ events }) => {
  return (
    <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-lg">
      <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-zinc-500">Interactive Calendar</h3>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {events.map((event, index) => (
          <React.Fragment key={event.id}>
            <div className="flex flex-col items-center group cursor-pointer min-w-[120px]">
              <div className={`text-[10px] font-bold uppercase mb-2 ${event.is_completed ? 'text-zinc-500' : 'text-f1-red'}`}>
                {event.is_completed ? '✓ Checked' : 'Upcoming'}
              </div>
              <div className={`h-1 w-full rounded-full transition-all ${event.is_completed ? 'bg-zinc-700' : 'bg-f1-red shadow-[0_0_10px_rgba(225,6,0,0.5)]'}`} />
              <p className="mt-3 text-[11px] font-black uppercase tracking-tighter italic group-hover:text-white transition-colors">
                {event.track_name}
              </p>
            </div>
            {index !== events.length - 1 && <div className="h-[2px] w-8 bg-zinc-800 self-center mt-6" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};