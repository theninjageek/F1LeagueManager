import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const SeasonManager = () => {
  const [seasons, setSeasons] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  
  // MODAL / OVERLAY STATES
  const [editingEvent, setEditingEvent] = useState(null);
  const [isAddWeekendOpen, setIsAddWeekendOpen] = useState(false);
  const [isPointsOpen, setIsPointsOpen] = useState(false);

  // FORM STATES
  const [newSeasonName, setNewSeasonName] = useState("");
  const [showSeasonInput, setShowSeasonInput] = useState(false);

  useEffect(() => {
    fetchSeasons();
    axios.get(`${API_URL}/tracks`).then(res => setTracks(res.data));
  }, []);

  useEffect(() => {
    if (selectedSeason) fetchEvents(selectedSeason.id);
  }, [selectedSeason]);

  const fetchSeasons = () => axios.get(`${API_URL}/seasons`).then(res => setSeasons(res.data));
  const fetchEvents = (id) => axios.get(`${API_URL}/seasons/${id}/events`).then(res => {
    setEvents(res.data.sort((a,b) => a.round_number - b.round_number));
  });

  const handleUpdateEvent = async (updates) => {
    try {
      await axios.patch(`${API_URL}/seasons/events/${editingEvent.id}`, updates);
      setEditingEvent({ ...editingEvent, ...updates });
      fetchEvents(selectedSeason.id);
    } catch (err) { console.error("Update failed", err); }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Delete this weekend from the calendar?")) {
      await axios.delete(`${API_URL}/seasons/events/${eventId}`);
      setEditingEvent(null);
      fetchEvents(selectedSeason.id);
    }
  };

  return (
    <div className="relative h-[calc(100vh-80px)] bg-[#050505] text-white flex overflow-hidden font-sans select-none">
      
      {/* SIDEBAR */}
      <div className="w-72 border-r border-zinc-900 flex flex-col bg-[#080808]">
        <div className="p-8 border-b border-zinc-900/50">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-6">Paddock</h2>
          {showSeasonInput ? (
            <div className="flex flex-col gap-2">
              <input autoFocus value={newSeasonName} onChange={(e) => setNewSeasonName(e.target.value)} placeholder="SEASON NAME..." className="bg-black border border-zinc-800 p-2 text-[10px] font-black uppercase outline-none focus:border-f1-red" />
              <div className="flex gap-1">
                <button onClick={async () => { await axios.post(`${API_URL}/seasons`, { name: newSeasonName }); fetchSeasons(); setShowSeasonInput(false); }} className="flex-grow bg-f1-red py-1 text-[9px] font-black uppercase italic">Create</button>
                <button onClick={() => setShowSeasonInput(false)} className="px-3 bg-zinc-800 py-1 text-[9px] font-black uppercase italic">✕</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowSeasonInput(true)} className="w-full py-2 border border-zinc-800 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">＋ Create New Season</button>
          )}
        </div>
        <div className="flex-grow overflow-y-auto py-4 custom-scrollbar">
          {seasons.map(s => (
            <button key={s.id} onClick={() => setSelectedSeason(s)} className={`w-full text-left px-8 py-4 text-[11px] font-black uppercase italic tracking-tight transition-all relative ${selectedSeason?.id === s.id ? 'text-white' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/30'}`}>
              {selectedSeason?.id === s.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-f1-red shadow-[0_0_15px_rgba(255,24,1,0.5)]" />}
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TIMELINE */}
      <div className="flex-grow overflow-y-auto custom-scrollbar p-12">
        {selectedSeason ? (
          <div className="max-w-6xl mx-auto">
            <header className="mb-16 flex justify-between items-start">
              <div>
                <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">{selectedSeason.name}</h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" /> Live Administration Mode</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsAddWeekendOpen(true)} className="px-6 py-2 border border-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Add Weekend</button>
                <button onClick={() => setIsPointsOpen(true)} className="px-6 py-2 border border-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Points Matrix</button>
              </div>
            </header>

            <div className="grid gap-4">
              {events.map((e) => (
                <div key={e.id} className="bg-[#0c0c0c] border border-zinc-900 flex items-center p-8 group relative overflow-hidden hover:bg-zinc-900/20 transition-colors">
                  <div className="w-24 border-r border-zinc-800 mr-8">
                    <span className="block text-[10px] font-black text-f1-red italic uppercase tracking-widest">Rnd</span>
                    <span className="text-5xl font-black italic leading-none">{String(e.round_number).padStart(2, '0')}</span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none group-hover:text-f1-red transition-colors">{e.track_name}</h3>
                    <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-2">{e.track_location}</p>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                      <span className="text-xs font-mono text-zinc-500 font-bold uppercase">{new Date(e.weekend_start).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                      <div className="flex justify-end gap-2 mt-3">
                        {e.has_sprint && <span className="border border-f1-red text-f1-red text-[8px] font-black px-2 py-0.5 italic">SPRINT</span>}
                        {e.is_reverse && <span className="border border-yellow-500 text-yellow-500 text-[8px] font-black px-2 py-0.5 italic">REVERSE</span>}
                        {parseFloat(e.points_multiplier) > 1 && <span className="border border-white text-white text-[8px] font-black px-2 py-0.5 italic">{e.points_multiplier}X</span>}
                      </div>
                    </div>
                    
                    {/* UPDATED: Clean Icon with Tooltip */}
                    <div className="relative group/tooltip">
                      <button onClick={() => setEditingEvent(e)} className="text-zinc-700 hover:text-f1-red transition-colors p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                      </button>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-[8px] font-black uppercase tracking-tighter px-2 py-1 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-700">Engineer Tuning</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center opacity-5 select-none"><h2 className="text-[12rem] font-black italic uppercase tracking-tighter">Paddock</h2></div>
        )}
      </div>

      {/* OVERLAYS */}
      {editingEvent && <EngineerPanel event={editingEvent} onClose={() => setEditingEvent(null)} onUpdate={handleUpdateEvent} onDelete={handleDeleteEvent} />}
      {isAddWeekendOpen && <AddWeekendPanel seasonId={selectedSeason.id} tracks={tracks} events={events} onClose={() => setIsAddWeekendOpen(false)} onRefresh={() => fetchEvents(selectedSeason.id)} />}
      {isPointsOpen && <PointsPanel season={selectedSeason} onClose={() => setIsPointsOpen(false)} onRefresh={fetchSeasons} />}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; }
        .color-scheme-dark { color-scheme: dark; }
        .animate-slide-in { animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const EngineerPanel = ({ event, onClose, onUpdate, onDelete }) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-md bg-[#0c0c0c] border-l border-f1-red h-full p-10 animate-slide-in shadow-2xl">
      <header className="flex justify-between items-start mb-12">
        <div>
          <span className="text-[10px] font-black text-f1-red uppercase tracking-[0.3em]">Engineer Tuning</span>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter mt-1">{event.track_name}</h2>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl">✕</button>
      </header>
      <div className="space-y-10">
        <section className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase">Start Date</label>
            <input type="date" value={event.weekend_start?.split('T')[0]} onChange={(ev) => onUpdate({ weekend_start: ev.target.value })} className="bg-black border border-zinc-800 p-3 text-xs font-bold color-scheme-dark outline-none focus:border-f1-red" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase">End Date</label>
            <input type="date" value={event.weekend_end?.split('T')[0]} onChange={(ev) => onUpdate({ weekend_end: ev.target.value })} className="bg-black border border-zinc-800 p-3 text-xs font-bold color-scheme-dark outline-none focus:border-f1-red" />
          </div>
        </section>
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase italic">Weekend Flags</h4>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onUpdate({ has_sprint: !event.has_sprint })} className={`p-4 border text-[10px] font-black italic uppercase transition-all ${event.has_sprint ? 'bg-f1-red text-white border-f1-red shadow-[0_0_10px_rgba(255,24,1,0.3)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Sprint Weekend</button>
            <button onClick={() => onUpdate({ is_reverse: !event.is_reverse })} className={`p-4 border text-[10px] font-black italic uppercase transition-all ${event.is_reverse ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>Reverse Layout</button>
          </div>
        </section>
        <section>
          <label className="text-[10px] font-black text-zinc-500 uppercase block mb-4 italic">Event Weighting</label>
          <div className="flex gap-2">
            {['1.0', '1.5', '2.0'].map(m => (
              <button key={m} onClick={() => onUpdate({ points_multiplier: m })} className={`flex-grow p-3 text-xs font-black border transition-all ${event.points_multiplier == m ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>{m}x</button>
            ))}
          </div>
        </section>
        <div className="pt-20 border-t border-zinc-900">
          <button onClick={() => onDelete(event.id)} className="w-full text-zinc-800 hover:text-red-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors py-4 italic border border-transparent hover:border-red-900/30">✕ Scrap this Event</button>
        </div>
      </div>
    </div>
  </div>
);

const AddWeekendPanel = ({ seasonId, tracks, events, onClose, onRefresh }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const [form, setForm] = useState({ 
    track_id: "", 
    round_number: "", 
    weekend_start: today, 
    weekend_end: today, 
    has_sprint: false, 
    is_reverse: false 
  });

  // Auto-populate Round Number
  useEffect(() => {
    const nextRound = events.length > 0 
      ? Math.max(...events.map(e => e.round_number)) + 1 
      : 1;
    setForm(prev => ({ ...prev, round_number: nextRound }));
  }, [events]);

  const submit = async () => { 
    if(!form.track_id) return; 
    await axios.post(`${API_URL}/seasons/${seasonId}/events`, form); 
    onRefresh(); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0c0c0c] border-l border-white h-full p-10 animate-slide-in shadow-2xl overflow-y-auto custom-scrollbar">
        <h2 className="text-3xl font-black italic uppercase mb-10 tracking-tighter">Add Race Weekend</h2>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">Select Circuit</label>
            <select value={form.track_id} onChange={e => setForm({...form, track_id: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 text-xs font-black uppercase outline-none focus:border-white">
              <option value="">CHOOSE TRACK...</option>
              {tracks.map(t => <option key={t.id} value={t.id}>{t.name} — {t.location}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">Round #</label>
              <input type="number" value={form.round_number} onChange={e => setForm({...form, round_number: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 text-xs font-black outline-none focus:border-white" />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">Layout</label>
              <button onClick={() => setForm({...form, is_reverse: !form.is_reverse})} className={`w-full p-4 border text-[10px] font-black italic uppercase transition-all ${form.is_reverse ? 'bg-yellow-500 text-black border-yellow-500' : 'border-zinc-800 text-zinc-500'}`}>
                {form.is_reverse ? 'REVERSE' : 'STANDARD'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">Start Date</label>
               <input type="date" value={form.weekend_start} onChange={e => setForm({...form, weekend_start: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 text-xs color-scheme-dark outline-none focus:border-white" />
            </div>
            <div>
               <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">End Date</label>
               <input type="date" value={form.weekend_end} onChange={e => setForm({...form, weekend_end: e.target.value})} className="bg-black border border-zinc-800 p-4 text-xs color-scheme-dark outline-none focus:border-white w-full" />
            </div>
          </div>
          <button onClick={submit} className="w-full bg-white text-black py-4 font-black italic uppercase text-sm mt-10 hover:bg-f1-red hover:text-white transition-all">Commit to Calendar</button>
        </div>
      </div>
    </div>
  );
};

const PointsPanel = ({ season, onClose, onRefresh }) => {
  const [matrix, setMatrix] = useState({
    race: season.points_matrix?.race || [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    sprint: season.points_matrix?.sprint || [8, 7, 6, 5, 4, 3, 2, 1],
    fastest_lap: season.points_matrix?.fastest_lap ?? 1
  });

  // Adds a new point position initialized to 0
  const addPosition = (type) => {
    setMatrix({
      ...matrix,
      [type]: [...matrix[type], 0]
    });
  };

  // Removes the last position if needed
  const removePosition = (type) => {
    if (matrix[type].length <= 1) return;
    const newArr = [...matrix[type]];
    newArr.pop();
    setMatrix({ ...matrix, [type]: newArr });
  };

  const updatePoint = (type, index, value) => {
    const newArr = [...matrix[type]];
    newArr[index] = value === "" ? "" : Number(value);
    setMatrix({ ...matrix, [type]: newArr });
  };

  const save = async () => {
    await axios.patch(`${API_URL}/seasons/${season.id}`, { points_matrix: matrix });
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0c0c0c] border-l border-white h-full p-10 animate-slide-in overflow-y-auto custom-scrollbar">
        
        <h2 className="text-3xl font-black italic uppercase mb-2 tracking-tighter">Scoring Logic</h2>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-10 italic">Rewards structure for {season.name}</p>

        {/* MAIN RACE SECTION */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
            <h3 className="text-[10px] font-black text-f1-red uppercase tracking-widest">Main Race</h3>
            <div className="flex gap-2">
              <button onClick={() => removePosition('race')} className="text-[9px] text-zinc-600 hover:text-white transition-colors">REMOVE P{matrix.race.length}</button>
              <button onClick={() => addPosition('race')} className="text-[9px] text-f1-red hover:text-white transition-colors">＋ ADD POSITION</button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {matrix.race.map((p, i) => (
              <div key={`race-${i}`} className="flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[9px] font-black text-zinc-600 uppercase italic">P{i+1}</span>
                <input 
                  type="number"
                  value={p} 
                  onChange={e => updatePoint('race', i, e.target.value)} 
                  className="bg-black border border-zinc-800 p-3 text-center text-xs font-black outline-none focus:border-white" 
                />
              </div>
            ))}
          </div>
        </section>

        {/* SPRINT SECTION */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
            <h3 className="text-[10px] font-black text-f1-red uppercase tracking-widest">Sprint Race</h3>
            <button onClick={() => addPosition('sprint')} className="text-[9px] text-f1-red hover:text-white transition-colors">＋ ADD POSITION</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {matrix.sprint.map((p, i) => (
              <div key={`sprint-${i}`} className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-zinc-600 uppercase italic">P{i+1}</span>
                <input 
                  type="number"
                  value={p} 
                  onChange={e => updatePoint('sprint', i, e.target.value)} 
                  className="bg-black border border-zinc-800 p-3 text-center text-xs font-black outline-none focus:border-white" 
                />
              </div>
            ))}
          </div>
        </section>

        {/* FASTEST LAP */}
        <section className="mb-10 p-6 bg-zinc-900/30 border border-zinc-800">
           <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black uppercase italic">Fastest Lap Bonus</h4>
                <p className="text-[9px] text-zinc-500 uppercase mt-1">Awarded for Top 10 finish</p>
              </div>
              <input 
                type="number" 
                value={matrix.fastest_lap} 
                onChange={e => setMatrix({...matrix, fastest_lap: Number(e.target.value)})}
                className="w-16 bg-black border border-zinc-700 p-2 text-center text-xs font-black outline-none focus:border-f1-red"
              />
           </div>
        </section>
        
        <button onClick={save} className="w-full bg-white text-black py-4 font-black italic uppercase text-sm hover:bg-f1-red hover:text-white transition-all">Update Season Rules</button>
      </div>
    </div>
  );
};