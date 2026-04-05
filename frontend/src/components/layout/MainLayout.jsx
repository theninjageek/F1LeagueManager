import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const [activeSeason, setActiveSeason] = useState(null);
  const [upcomingRaces, setUpcomingRaces] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Use a Ref to persist the timer ID across renders
  const timeoutRef = useRef(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/seasons/active`)
      .then(res => setActiveSeason(res.data));

    axios.get(`${import.meta.env.VITE_API_URL}/calendar`)
      .then(res => {
        const nextRaces = res.data
          .filter(r => !r.is_completed)
          .slice(0, 4);
        setUpcomingRaces(nextRaces);
      });
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Start the timer to close the dropdown
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="px-8 py-6 border-b border-zinc-900 bg-[#050505] sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-1.5 h-8 bg-f1-red shadow-[0_0_10px_rgba(225,6,0,0.4)] group-hover:h-10 transition-all"></div>
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">Championship</p>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">{activeSeason?.name || 'F1 LEAGUE'}</h1>
            </div>
          </Link>

          <nav className="flex items-center gap-8">
            <Link to="/" className={`text-[10px] font-black uppercase tracking-[0.2em] ${isActive('/') ? 'text-f1-red' : 'text-zinc-400 hover:text-white'}`}>
              Standings
            </Link>

            {/* CALENDAR CONTAINER */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                to="/calendar" 
                className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] py-4 transition-all ${isActive('/calendar') ? 'text-f1-red' : 'text-zinc-400 hover:text-white'}`}
              >
                Calendar
                <span className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>▾</span>
              </Link>

              {/* THE DROPDOWN MENU */}
              {isDropdownOpen && (
              <div 
                className="absolute top-[100%] right-0 w-64 bg-[#111] border border-zinc-800 shadow-2xl rounded-lg p-2 animate-in fade-in slide-in-from-top-1 duration-200 z-[110]"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="px-3 py-2 border-b border-zinc-900">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Next Events</p>
                </div>

                <div className="flex flex-col">
                  {upcomingRaces.length > 0 ? (
                    <>
                      {upcomingRaces.map(race => (
                        <Link 
                          key={race.id}
                          to="/calendar"
                          className="flex items-center gap-3 p-3 hover:bg-zinc-900 rounded-md transition-colors group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-10 h-6 bg-zinc-800 rounded flex items-center justify-center overflow-hidden">
                            <img 
                              src={`/assets/tracks/${race.track_id}.avif`} 
                              className="h-full opacity-40 group-hover:opacity-100 grayscale invert transition-all"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold leading-none mb-1">RND {race.round_number}</p>
                            <p className="text-xs font-black uppercase italic text-zinc-300 group-hover:text-white">{race.track_name}</p>
                          </div>
                        </Link>
                      ))}
                      
                      {/* THE MISSING LINK */}
                      <Link 
                        to="/calendar"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block text-center py-3 mt-1 border-t border-zinc-900 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-f1-red hover:bg-zinc-900/50 transition-all rounded-b-md"
                      >
                        View Full Schedule →
                      </Link>
                    </>
                  ) : (
                    <p className="p-4 text-[10px] text-zinc-600 uppercase text-center italic">Season Completed</p>
                  )}
                </div>
              </div>
            )}
            </div>

            <div className="w-px h-4 bg-zinc-800 mx-2 hidden md:block"></div>
            
            <Link to="/paddock" className={`text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-800 px-3 py-1.5 rounded hover:border-f1-red transition-all ${location.pathname.startsWith('/paddock') ? 'text-f1-red border-f1-red' : 'text-zinc-500'}`}>
              Admin Paddock
            </Link>
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-160px)]">
        {children}
      </main>
    </div>
  );
};