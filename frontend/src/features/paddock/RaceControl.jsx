import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const API_URL = import.meta.env.VITE_API_URL;

const SESSIONS = [
  { id: 'QUALIFYING', label: 'Qualifying' },
  { id: 'SPRINT_QUALIFYING', label: 'Sprint Qualy' },
  { id: 'SPRINT_RACE', label: 'Sprint Race' },
  { id: 'GRAND_PRIX', label: 'Grand Prix' }
];

const formatInterval = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val; // Already a string
  
  // If it's a Postgres Interval Object
  const h = val.hours || 0;
  const m = val.minutes || 0;
  const s = val.seconds || 0;
  const ms = val.milliseconds || 0;

  // Format as HH:MM:SS.ms (adjust based on your preference)
  const parts = [];
  if (h > 0) parts.push(h.toString().padStart(2, '0'));
  parts.push(m.toString().padStart(2, '0'));
  parts.push(s.toString().padStart(2, '0'));
  
  let str = parts.join(':');
  if (ms > 0) str += `.${ms}`;
  return str;
};

export const RaceControl = () => {
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [classification, setClassification] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeSession, setActiveSession] = useState('QUALIFYING');
  const [calendar, setCalendar] = useState([]);

  const getPointsPreview = (index, driver) => {
    let points = 0;
    if (activeSession === 'GRAND_PRIX') {
      const raceMatrix = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
      points = raceMatrix[index] || 0;
      if (driver.fastest_lap && index < 10 && !driver.is_dnf) points += 1;
    } else if (activeSession === 'SPRINT_RACE') {
      const sprintMatrix = [8, 7, 6, 5, 4, 3, 2, 1];
      points = sprintMatrix[index] || 0;
    }
    return points;
  };

  const filterAssignedDrivers = (drivers) => {
    return drivers.filter(d => d.team_id || d.current_team_id);
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const [driversRes, calendarRes] = await Promise.all([
          axios.get(`${API_URL}/drivers`),
          axios.get(`${API_URL}/calendar`)
        ]);
        setCalendar(calendarRes.data);
        const nextRace = calendarRes.data.find(e => !e.is_completed);
        if (nextRace) setActiveEvent(nextRace.id);
        setLoading(false);
      } catch (err) {
        console.error("Init failed", err);
        setLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    const hydrateSession = async () => {
      if (!activeEvent) return;

      try {
        const res = await axios.get(`${API_URL}/events/${activeEvent}/starting-grid?session=${activeSession}`);
        const allDriversRes = await axios.get(`${API_URL}/drivers`);
        const allDrivers = filterAssignedDrivers(allDriversRes.data);

        if (res.data?.data?.length > 0) {
          setClassification(res.data.data.map(d => ({ 
            ...d, 
            is_dnf: d.is_dnf || false, 
            fastest_lap: d.fastest_lap || false,
            best_lap_time: formatInterval(d.best_lap_time),
            total_race_time: formatInterval(d.total_race_time),
            grid_position: d.grid_position || null
          })));
          const rankedIds = res.data.data.map(d => d.id || d.driver_id);
          setAvailableDrivers(allDrivers.filter(d => !rankedIds.includes(d.id)));
        } 
        else {
          let fallbackSession = 'QUALIFYING';
          if (activeSession === 'SPRINT_RACE') {
            fallbackSession = 'SPRINT_QUALIFYING';
          } 

          const fallbackRes = await axios.get(`${API_URL}/events/${activeEvent}/starting-grid?session=${fallbackSession}`);
          
          if (fallbackRes.data?.data?.length > 0) {
            setClassification(fallbackRes.data.data.map((d, idx) => ({ 
              ...d, 
              is_dnf: false, 
              fastest_lap: false,
              grid_position: idx + 1, // Set grid position from fallback order
              best_lap_time: '',
              total_race_time: ''
            })));
            const rankedIds = fallbackRes.data.data.map(d => d.id || d.driver_id);
            setAvailableDrivers(allDrivers.filter(d => !rankedIds.includes(d.id)));
          } else if (activeSession === 'SPRINT_RACE') {
            const finalFallback = await axios.get(`${API_URL}/events/${activeEvent}/starting-grid?session=QUALIFYING`);
            if (finalFallback.data?.data?.length > 0) {
              setClassification(finalFallback.data.data.map((d, idx) => ({ 
                ...d, 
                is_dnf: false, 
                fastest_lap: false,
                grid_position: idx + 1,
                best_lap_time: '',
                total_race_time: ''
              })));
              const rankedIds = finalFallback.data.data.map(d => d.id || d.driver_id);
              setAvailableDrivers(allDrivers.filter(d => !rankedIds.includes(d.id)));
            } else {
              resetGrid(allDrivers);
            }
          } else {
            resetGrid(allDrivers);
          }
        }
      } catch (err) {
        console.error("Hydration Error:", err);
      }
    };

    const resetGrid = (allDrivers) => {
      setClassification([]);
      setAvailableDrivers(allDrivers);
    };

    hydrateSession();
  }, [activeSession, activeEvent]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(classification);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setClassification(items);
  };

  const rankDriver = (driver) => {
    setClassification([...classification, { 
      ...driver, 
      is_dnf: false, 
      fastest_lap: false, 
      best_lap_time: '', 
      total_race_time: '',
      grid_position: null 
    }]);
    setAvailableDrivers(availableDrivers.filter(d => d.id !== driver.id));
  };

  const unrankDriver = (driverId) => {
    const driver = classification.find(d => d.id === driverId);
    setAvailableDrivers([...availableDrivers, driver]);
    setClassification(classification.filter(d => d.id !== driverId));
  };

  const updateField = (index, field, value) => {
    const updated = [...classification];
    updated[index][field] = value;
    setClassification(updated);
  };

  const toggleStatus = (index, field) => {
    const updated = [...classification];
    updated[index][field] = !updated[index][field];
    if (field === 'is_dnf' && updated[index].is_dnf) {
      updated[index].fastest_lap = false;
    }
    setClassification(updated);
  };

  const handleFinalize = async () => {
    if (!activeEvent) return;
    const sessionLabel = SESSIONS.find(s => s.id === activeSession).label;
    if (!window.confirm(`Publish ${sessionLabel} results?`)) return;
    try {
      const payload = {
        eventId: activeEvent,
        sessionType: activeSession, 
        results: classification.map((d, index) => ({
          driver_id: d.id,
          team_id: d.team_id || d.current_team_id,
          position: index + 1,
          grid_position: d.grid_position,
          best_lap_time: d.best_lap_time?.trim() || null,
          total_race_time: d.total_race_time?.trim() || null,
          is_dnf: d.is_dnf,
          fastest_lap: d.fastest_lap
        }))
      };
      await axios.post(`${API_URL}/events/finalize`, payload);
      alert("Results Published.");
      if (activeSession === 'GRAND_PRIX') window.location.href = '/paddock';
    } catch (err) { alert("Error saving."); }
  };

  if (loading) return <div className="p-8 text-white font-black italic uppercase">Scanning Paddock...</div>;

  const currentEvent = calendar.find(e => e.id == activeEvent);
  const isSprintWeekend = currentEvent?.has_sprint === true || currentEvent?.has_sprint === 1;

  return (
    <div className="max-w-7xl mx-auto p-4 text-white">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-900 pb-8">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">Race Control</h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Session Logistics</p>
        </div>
        <div className="flex gap-4">
          <select value={activeEvent || ""} onChange={(e) => setActiveEvent(e.target.value)} className="bg-zinc-950 border border-zinc-800 p-3 text-xs font-bold uppercase outline-none">
            {calendar.map(event => (
              <option key={event.id} value={event.id}>R{event.round_number}: {event.track_name}</option>
            ))}
          </select>
          <select value={activeSession} onChange={(e) => setActiveSession(e.target.value)} className="bg-zinc-950 border border-zinc-800 p-3 text-f1-red text-xs font-bold uppercase outline-none">
            {SESSIONS.map(s => {
              if (s.id.includes('SPRINT') && !isSprintWeekend) return null;
              return <option key={s.id} value={s.id}>{s.label}</option>;
            })}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0c0c0c] p-6 border border-zinc-900">
          <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-widest border-b border-zinc-900 pb-2 flex justify-between">
            <span>Entry List</span>
            <span>{availableDrivers.length} Left</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {availableDrivers.map(driver => (
              <button key={driver.id} onClick={() => rankDriver(driver)} className="bg-zinc-900 border-l-4 p-3 text-left border-zinc-800 hover:bg-zinc-800 transition-all" style={{ borderLeftColor: driver.color_hex }}>
                <p className="text-[8px] text-zinc-500 uppercase font-bold truncate">{driver.team_name}</p>
                <p className="font-black uppercase text-[11px] truncate">{driver.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0c0c0c] p-6 border border-zinc-900 shadow-2xl relative min-h-[500px]">
          <h3 className="text-[10px] font-black uppercase text-f1-red mb-6 tracking-widest border-b border-zinc-900 pb-2">Classification</h3>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="classification">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                  {classification.map((d, i) => (
                    <Draggable key={d.id.toString()} draggableId={d.id.toString()} index={i}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                             className={`flex items-center bg-zinc-900/50 border border-zinc-800 h-14 pr-4 transition-all ${snapshot.isDragging ? 'z-50 bg-zinc-800 border-f1-red scale-[1.01]' : ''}`}>
                          <div className="bg-zinc-800 w-10 h-full flex items-center justify-center font-black italic text-xs text-zinc-500">P{i + 1}</div>
                          <div className="w-1 h-full mx-3" style={{ backgroundColor: d.color_hex }} />
                          
                          <div className="flex-grow min-w-0">
                            <div className="font-bold uppercase text-[11px] truncate flex items-center gap-2">
                              {d.name} 
                              {getPointsPreview(i, d) > 0 && <span className="text-zinc-600 text-[9px] font-normal italic">+{getPointsPreview(i, d)}</span>}
                            </div>
                            <input 
                              type="text" 
                              placeholder={activeSession.includes('QUALIFYING') ? "QUALI TIME" : "BEST LAP"}
                              value={d.best_lap_time || ''}
                              onChange={(e) => updateField(i, 'best_lap_time', e.target.value)}
                              className="bg-transparent text-[9px] text-zinc-500 outline-none w-full uppercase placeholder:text-zinc-800"
                            />
                          </div>

                          {(activeSession === 'GRAND_PRIX' || activeSession === 'SPRINT_RACE') && (
                            <input 
                              type="text" 
                              placeholder={i === 0 ? "TOTAL TIME" : "+ GAP"}
                              value={d.total_race_time || ''}
                              onChange={(e) => updateField(i, 'total_race_time', e.target.value)}
                              className="bg-zinc-950 border border-zinc-800 text-[10px] px-2 py-1 w-20 mx-2 text-right font-mono text-zinc-400 focus:border-f1-red outline-none"
                            />
                          )}

                          <div className="flex items-center gap-1">
                            {(activeSession === 'GRAND_PRIX' || activeSession === 'SPRINT_RACE') && (
                              <button onClick={() => toggleStatus(i, 'fastest_lap')} 
                                      className={`w-7 h-7 text-[8px] font-black border transition-all ${d.fastest_lap ? 'bg-purple-600 border-purple-600 text-white' : 'text-zinc-700 border-zinc-800 hover:text-white'}`}>FL</button>
                            )}
                            <button onClick={() => toggleStatus(i, 'is_dnf')} 
                                    className={`w-8 h-7 text-[8px] font-black border transition-all ${d.is_dnf ? 'bg-zinc-700 border-zinc-700 text-white' : 'text-zinc-700 border-zinc-800 hover:text-red-500'}`}>DNF</button>
                            <button onClick={() => unrankDriver(d.id)} className="ml-1 text-zinc-800 hover:text-white p-1">✕</button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {classification.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-900">
              <button onClick={handleFinalize} className="w-full bg-white text-black py-4 font-black italic uppercase hover:bg-f1-red hover:text-white transition-all tracking-tighter">
                Publish {activeSession.replace('_', ' ')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};