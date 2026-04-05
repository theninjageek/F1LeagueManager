import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon, BotIcon, TrashIcon } from '../../components/Icons';

const API_URL = import.meta.env.VITE_API_URL;

export const DriverMarket = () => {
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Persistence logic: Default to TRUE (hidden)
  const [hideAI, setHideAI] = useState(() => {
    const saved = localStorage.getItem('f1_hide_ai');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [newDriver, setNewDriver] = useState({
    name: '',
    race_number: '',
    current_team_id: '',
    country_code: '',
    is_ai: false
  });

  useEffect(() => {
    localStorage.setItem('f1_hide_ai', JSON.stringify(hideAI));
  }, [hideAI]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [driverRes, teamRes] = await Promise.all([
        axios.get(`${API_URL}/drivers`),
        axios.get(`${API_URL}/teams`)
      ]);
      setDrivers(Array.isArray(driverRes.data) ? driverRes.data : []);
      setTeams(Array.isArray(teamRes.data) ? teamRes.data : []);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransfer = async (driverId, newTeamId) => {
    try {
      const payload = { teamId: newTeamId === "NULL" ? null : newTeamId };
      await axios.put(`${API_URL}/drivers/${driverId}/transfer`, payload);
      loadData(); 
    } catch (err) {
      alert("Transfer failed.");
    }
  };

  const handleSignDriver = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newDriver, current_team_id: newDriver.current_team_id || null };
      const res = await axios.post(`${API_URL}/drivers`, payload);
      setDrivers(prev => [...prev, res.data]);
      setShowAddModal(false);
      setNewDriver({ name: '', race_number: '', current_team_id: '', country_code: '', is_ai: false });
    } catch (err) {
      alert("System Error: Could not finalize contract.");
    }
  };

  const handleRelease = async (id) => {
    if (!window.confirm("Terminate driver contract?")) return;
    try {
      await axios.delete(`${API_URL}/drivers/${id}`);
      setDrivers(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error("Deletion failed", err);
    }
  };

  const displayedDrivers = hideAI ? drivers.filter(d => !d.is_ai) : drivers;

  return (
    <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center mb-12 border-b border-zinc-900 pb-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Grid Roster</h1>
          
          <button 
            onClick={() => setHideAI(!hideAI)}
            className={`flex items-center gap-2 px-3 py-1.5 border text-[10px] font-black uppercase transition-all w-fit ${
              hideAI 
                ? 'border-zinc-700 text-zinc-500 hover:border-f1-red hover:text-f1-red' 
                : 'border-f1-red text-f1-red bg-f1-red/10'
            }`}
          >
            <BotIcon className="w-3 h-3" />
            {hideAI ? 'Show AI Drivers' : 'Hide AI Drivers'}
          </button>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-f1-red text-white px-8 py-4 font-black uppercase italic text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-all shadow-lg shadow-f1-red/20"
        >
          <PlusIcon className="w-4 h-4" /> Sign Driver
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedDrivers.map(driver => {
          // Sync team data for colors and logos
          const team = teams.find(t => t.id === driver.team_id || t.id === driver.current_team_id);
          
          return (
            <div key={driver.id} className="bg-[#0f0f0f] border border-zinc-900 p-8 relative group transition-all hover:border-zinc-700 overflow-hidden min-h-[220px] flex flex-col justify-between">
              {/* BRANDING STRIP */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 transition-colors duration-500 z-30" 
                style={{ backgroundColor: team?.color_hex || '#27272a' }} 
              />

              {/* CENTERED BACKGROUND LOGO WATERMARK */}
              {team?.team_icon_url && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                  <img 
                    src={team.team_icon_url} 
                    alt="" 
                    className="w-48 h-48 object-contain filter grayscale opacity-30 group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 blur-[2px] group-hover:blur-none"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              
              {/* TOP CONTENT */}
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {team?.name || 'Free Agent'}
                    </span>
                    {driver.is_ai && <BotIcon className="w-3 h-3 text-f1-red" />}
                  </div>
                  <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter drop-shadow-md">
                    {driver.name}
                  </h3>
                </div>
                <span className="text-4xl font-black italic text-zinc-900 group-hover:text-zinc-800 transition-colors">
                  {driver.race_number}
                </span>
              </div>

              {/* BOTTOM CONTENT */}
              <div className="relative z-10 mt-8 pt-4 border-t border-zinc-900/50 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-600 uppercase italic tracking-[0.3em]">
                    {driver.country_code || 'INT'}
                  </span>
                  <button 
                    onClick={() => handleRelease(driver.id)} 
                    className="text-zinc-800 hover:text-red-500 transition-colors p-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                <select 
                  className="w-full bg-black/50 border border-zinc-800 p-3 text-[10px] font-black uppercase text-zinc-400 outline-none cursor-pointer focus:border-zinc-600 transition-all backdrop-blur-sm"
                  value={driver.team_id || "NULL"}
                  onChange={(e) => handleTransfer(driver.id, e.target.value)}
                  style={{ borderLeft: team ? `4px solid ${team.color_hex}` : '1px solid #27272a' }}
                >
                  <option value="NULL">— RELEASE TO FREE AGENCY —</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}

        {displayedDrivers.length === 0 && !loading && (
          <div className="col-span-full py-32 text-center border border-dashed border-zinc-900">
            <p className="text-zinc-700 uppercase text-[10px] font-black tracking-[0.5em] italic">
              {hideAI ? 'No Human Drivers Found' : 'Grid Vacant'}
            </p>
          </div>
        )}
      </div>

      {/* SIGN DRIVER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
           <form onSubmit={handleSignDriver} className="bg-[#0c0c0c] border border-zinc-800 w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black italic uppercase mb-8 text-white tracking-tighter border-b border-zinc-900 pb-4">
              Contract Registration
            </h2>
            <div className="space-y-6">
              <div 
                onClick={() => setNewDriver({...newDriver, is_ai: !newDriver.is_ai})}
                className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                  newDriver.is_ai ? 'border-f1-red bg-f1-red/5' : 'border-zinc-800 bg-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BotIcon className={`w-5 h-5 ${newDriver.is_ai ? 'text-f1-red' : 'text-zinc-600'}`} />
                  <span className={`text-[10px] font-black uppercase italic ${newDriver.is_ai ? 'text-white' : 'text-zinc-500'}`}>
                    AI Simulated Profile
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${newDriver.is_ai ? 'bg-f1-red animate-pulse shadow-[0_0_8px_#ff1801]' : 'bg-zinc-800'}`} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1">Legal Name</label>
                <input required placeholder="E.G. LEWIS HAMILTON" className="w-full bg-black border border-zinc-800 p-4 text-white font-bold outline-none focus:border-f1-red uppercase italic" value={newDriver.name} onChange={(e) => setNewDriver({...newDriver, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1">Race No.</label>
                  <input required placeholder="44" className="w-full bg-black border border-zinc-800 p-4 text-white font-bold outline-none text-center" value={newDriver.race_number} onChange={(e) => setNewDriver({...newDriver, race_number: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1">Origin</label>
                  <input required placeholder="GBR" className="w-full bg-black border border-zinc-800 p-4 text-white font-bold outline-none uppercase text-center" value={newDriver.country_code} onChange={(e) => setNewDriver({...newDriver, country_code: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1">Initial Assignment</label>
                <select 
                  className="w-full bg-black border border-zinc-800 p-4 text-white font-bold outline-none cursor-pointer appearance-none uppercase italic" 
                  value={newDriver.current_team_id} 
                  onChange={(e) => setNewDriver({...newDriver, current_team_id: e.target.value})}
                >
                  <option value="">— FREE AGENT —</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-grow py-4 text-[10px] font-black uppercase border border-zinc-800 text-zinc-500 hover:text-white transition-colors">Abort</button>
                <button type="submit" className="flex-grow py-4 text-[10px] font-black uppercase bg-white text-black hover:bg-f1-red hover:text-white transition-all">Sign Contract</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};