import React from 'react';
import { Link } from 'react-router-dom';
import { FlagIcon, UsersIcon, GearIcon, ShieldIcon } from '../../components/Icons'; 

export const PaddockDashboard = () => {
  const actions = [
    { 
      title: 'Race Control', 
      desc: 'Enter results for the next round', 
      icon: <FlagIcon className="w-8 h-8" />, 
      path: '/paddock/race-control' 
    },
    { 
      title: 'Driver Market', 
      desc: 'Manage transfers and numbers', 
      icon: <UsersIcon className="w-8 h-8" />, 
      path: '/paddock/drivers' 
    },
    { 
      title: 'Constructors', 
      desc: 'Brand identity and team livery', 
      icon: <ShieldIcon className="w-8 h-8" />, 
      path: '/paddock/teams' 
    },
    { 
      title: 'Season Setup', 
      desc: 'Adjust points and tracks', 
      icon: <GearIcon className="w-8 h-8" />, 
      path: '/paddock/seasons' 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Paddock Control</h1>
        <div className="flex items-center gap-2 mt-2">
           <span className="w-2 h-2 bg-f1-red rounded-full animate-pulse shadow-[0_0_8px_#ff1801]" />
           <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-[0.3em]">Admin Session Active</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => (
          <Link 
            key={action.title} 
            to={action.path} 
            className="bg-[#0f0f0f] border border-zinc-900 p-8 text-left hover:border-f1-red transition-all group relative overflow-hidden flex flex-col min-h-[220px]"
          >
            {/* Background Accent Letter */}
            <div className="absolute -right-4 -bottom-4 text-[10rem] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity italic font-black -skew-x-12 select-none pointer-events-none text-white">
              {action.title[0]}
            </div>
            
            <div className="text-f1-red mb-6 transform group-hover:scale-110 transition-transform origin-left">
              {action.icon}
            </div>
            
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2 text-white">
              {action.title}
            </h3>
            <p className="text-zinc-500 text-xs font-bold leading-relaxed">
              {action.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};