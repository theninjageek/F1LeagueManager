import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, FlagIcon, UsersIcon, GearIcon, ShieldIcon } from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';

export const PaddockLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menu = [
    { name: 'Dashboard', path: '/paddock', icon: <HomeIcon /> },
    { name: 'Race Control', path: '/paddock/race-control', icon: <FlagIcon /> },
    { name: 'Driver Market', path: '/paddock/drivers', icon: <UsersIcon /> },
    { name: 'Constructors', path: '/paddock/teams', icon: <ShieldIcon /> },
    { name: 'Season Management', path: '/paddock/seasons', icon: <GearIcon /> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside 
        className={`bg-[#080808] border-r border-zinc-900 transition-all duration-300 flex flex-col
          ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* INLINE TOGGLE AREA */}
        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-zinc-900/50 mb-4`}>
          {!isCollapsed && (
            <span className="text-[10px] font-black tracking-[0.4em] text-zinc-600 uppercase italic">
              Paddock
            </span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-zinc-600 hover:text-f1-red transition-colors p-1"
          >
            <svg 
              className={`w-4 h-4 transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-2 gap-1 flex-grow">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative group flex items-center transition-all duration-200 py-4
                  ${isActive 
                    ? 'bg-f1-red text-white' 
                    : 'text-zinc-500 hover:bg-zinc-900/30 hover:text-zinc-200'}`}
              >
                {/* Icon Container */}
                <div className={`flex items-center justify-center ${isCollapsed ? 'w-full' : 'w-16'}`}>
                  {React.cloneElement(item.icon, { className: "w-5 h-5" })}
                </div>

                {/* Label */}
                {!isCollapsed && (
                  <span className="font-black uppercase italic tracking-tighter text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                    {item.name}
                  </span>
                )}

                {/* Tooltip for Collapsed State */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1 bg-zinc-900 border border-zinc-700 text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="border-t border-zinc-900/50 p-2">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-900/30 transition-colors
                ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-f1-red/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-f1-red" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                  <p className="text-xs text-zinc-500">Admin</p>
                </div>
              )}
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className={`absolute bottom-full mb-2 ${isCollapsed ? 'left-full ml-2' : 'left-0 right-0'} bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden`}>
                  <Link
                    to="/paddock/users"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-sm"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span className="text-white">User Management</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-sm border-t border-zinc-800"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <div className="p-6 border-t border-zinc-900/50 text-[9px] uppercase text-zinc-800 font-black tracking-widest italic animate-in fade-in">
            v3.1
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow bg-[#0c0c0c] p-5 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};