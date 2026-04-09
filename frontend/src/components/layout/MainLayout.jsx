import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStandings, useCalendar } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal } from '../LoginModal';
import apiClient from '../../lib/apiClient';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [activeSeason, setActiveSeason] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const timeoutRef = useRef(null);

  // Fetch active season
  React.useEffect(() => {
    apiClient.get('/seasons/active')
      .then(res => setActiveSeason(res.data))
      .catch(err => console.error('Failed to fetch active season:', err));
  }, []);

  // Fetch calendar
  const { data: allEvents = [] } = useCalendar();
  const upcomingRaces = allEvents
    .filter(r => !r.is_completed)
    .slice(0, 4);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
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
            <div className="w-1.5 h-8 bg-f1-red shadow-[0_0_10px_rgba(225,6,0,0.4)] group-hover:h-10 transition-all" />
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-1">Championship</p>
              <h1 className="text-xl font-black italic uppercase tracking-tighter">{activeSeason?.name || 'F1 LEAGUE'}</h1>
            </div>
          </Link>

          <nav className="flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                isActive('/') ? 'text-f1-red' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Standings
            </Link>

            {/* CALENDAR DROPDOWN */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Link 
                to="/calendar" 
                className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] py-4 transition-all ${
                  isActive('/calendar') ? 'text-f1-red' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Calendar
                <span className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>▾</span>
              </Link>

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
                                alt={race.track_name}
                                className="h-full opacity-40 group-hover:opacity-100 grayscale invert transition-all"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold leading-none mb-1">RND {race.round_number} - {new Date(race.weekend_start).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})} </p>
                              <p className="text-xs font-black uppercase italic text-zinc-300 group-hover:text-white">{race.track_name}</p>
                            </div>
                          </Link>
                        ))}
                        
                        <Link 
                          to="/calendar"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block text-center py-3 mt-1 border-t border-zinc-900 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-f1-red hover:bg-zinc-900/50 transition-all"
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

            <div className="w-px h-4 bg-zinc-800 mx-2 hidden md:block" />
            
            {isAuthenticated ? (
              <Link 
                to="/paddock" 
                className={`text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-800 px-3 py-1.5 rounded transition-all ${
                  location.pathname.startsWith('/paddock') 
                    ? 'border-f1-red text-f1-red' 
                    : 'text-zinc-400 hover:border-f1-red hover:text-white'
                }`}
              >
                Admin Paddock
              </Link>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-800 px-3 py-1.5 rounded transition-all text-zinc-400 hover:border-f1-red hover:text-white"
              >
                Admin Paddock
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-160px)]">
        {children}
      </main>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};