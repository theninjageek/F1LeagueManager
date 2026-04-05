import React from 'react';

const CalendarSlider = ({ events }) => {
  return (
    <div className="w-full bg-black border-b border-zinc-800 py-4">
      <div className="flex overflow-x-auto px-8 gap-6 no-scrollbar">
        {events.map((event) => (
          <div key={event.id} className="flex-shrink-0 w-40 group cursor-pointer">
            <div className={`h-24 w-full relative overflow-hidden transition-all border-b-4 
              ${event.is_completed ? 'border-f1-red opacity-100' : 'border-zinc-700 opacity-50'}`}>
              
              {/* Reverse Track Badge */}
              {event.is_reverse && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-2 -skew-x-12">
                  REVERSE
                </div>
              )}
              
              <img 
                src={`/assets/tracks/${event.country_code}.png`} 
                className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform" 
                alt={event.name} 
              />
            </div>
            <p className="text-[10px] font-bold uppercase mt-2 tracking-tighter text-zinc-400 group-hover:text-white">
              {event.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSlider;