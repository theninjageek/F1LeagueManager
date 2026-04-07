import React, { useState } from 'react';
import { useTeams, useCreateTeam, useDeleteTeam } from '../../hooks/usePaddock';
import { PlusIcon, ShieldIcon } from '../../components/Icons';

const AVAILABLE_LOGOS = [
  { label: 'None / Custom', value: '' },
  { label: 'Red Bull', value: '/logos/redbull.svg' },
  { label: 'Ferrari', value: '/logos/ferrari.svg' },
  { label: 'Mercedes', value: '/logos/mercedes.svg' },
  { label: 'McLaren', value: '/logos/mclaren.svg' },
  { label: 'Aston Martin', value: '/logos/astonmartin.svg' },
  { label: 'Audi', value: '/logos/audi.svg' },
  { label: 'Williams', value: '/logos/williams.svg' },
  { label: 'RB (Visa)', value: '/logos/rb.svg' },
  { label: 'Alpine', value: '/logos/alpine.svg' },
  { label: 'Haas', value: '/logos/haas.svg' },
];

export const TeamManager = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: teams = [], isLoading } = useTeams();
  const createMutation = useCreateTeam();
  const deleteMutation = useDeleteTeam();
  
  const [newTeam, setNewTeam] = useState({ 
    name: '', 
    color_hex: '#e10600', 
    team_icon_url: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(newTeam);
      setShowModal(false);
      setNewTeam({ name: '', color_hex: '#e10600', team_icon_url: '' });
    } catch (err) {
      alert("Registration Failed: " + err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-white">Loading teams...</div>;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="flex justify-between items-end mb-12 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Constructors</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Local Assets Verified
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-f1-red text-white px-8 py-4 font-black uppercase italic text-xs hover:bg-white hover:text-black transition-all shadow-lg shadow-f1-red/20"
        >
          <PlusIcon className="w-4 h-4 inline mr-2" /> Register Team
        </button>
      </header>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-[#0f0f0f] border border-zinc-900 p-8 flex flex-col items-center group relative overflow-hidden transition-all hover:border-zinc-700">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: team.color_hex }} />
            
            <div className="w-24 h-24 mb-6 flex items-center justify-center relative">
              {team.team_icon_url ? (
                <img 
                  src={team.team_icon_url} 
                  className="max-w-full max-h-full object-contain filter grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 z-10" 
                  alt={team.name}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-black italic text-zinc-800 group-hover:text-zinc-700 transition-colors z-0">
                {team.name[0]}
              </div>
            </div>

            <h3 className="text-md font-black uppercase italic text-white mb-2 text-center tracking-tighter">{team.name}</h3>
            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: team.color_hex, color: team.color_hex }} />
              <code className="text-[10px] text-zinc-500 font-mono uppercase">{team.color_hex}</code>
            </div>
          </div>
        ))}
      </div>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <form onSubmit={handleSubmit} className="bg-[#0c0c0c] border border-zinc-800 w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-zinc-900 text-f1-red">
                <ShieldIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">New Constructor</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block tracking-[0.2em]">Full Team Identity</label>
                <input 
                  required 
                  placeholder="E.G. SCUDERIA FERRARI HP" 
                  className="w-full bg-black border border-zinc-800 p-4 text-white font-bold outline-none focus:border-f1-red transition-colors uppercase italic" 
                  value={newTeam.name} 
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block tracking-[0.2em]">Livery Color</label>
                  <div className="flex gap-3 items-center bg-black border border-zinc-800 p-3">
                    <input 
                      type="color" 
                      className="w-8 h-8 bg-transparent border-none cursor-pointer" 
                      value={newTeam.color_hex} 
                      onChange={(e) => setNewTeam({...newTeam, color_hex: e.target.value})} 
                    />
                    <span className="text-zinc-400 font-mono text-[10px] uppercase">{newTeam.color_hex}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block tracking-[0.2em]">Asset Selection</label>
                  <select 
                    className="w-full bg-black border border-zinc-800 p-3.5 text-zinc-400 font-bold text-[10px] outline-none focus:border-f1-red appearance-none cursor-pointer"
                    value={newTeam.team_icon_url}
                    onChange={(e) => setNewTeam({...newTeam, team_icon_url: e.target.value})}
                  >
                    {AVAILABLE_LOGOS.map(logo => (
                      <option key={logo.value} value={logo.value}>{logo.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-grow py-4 text-[10px] font-black uppercase border border-zinc-800 text-zinc-500 hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="flex-grow py-4 text-[10px] font-black uppercase bg-white text-black hover:bg-f1-red hover:text-white transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Registering...' : 'Confirm Entry'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};