import React, { useState } from 'react';
import { useCalendarForPaddock, useStartingGrid, useFinalizeResults, useDrivers, useSeasons } from '../../hooks/usePaddock';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SESSION_TYPES } from '../../constants';

const SESSIONS = [
  { id: 'QUALIFYING', label: 'Qualifying' },
  { id: 'SPRINT_QUALIFYING', label: 'Sprint Qualy' },
  { id: 'SPRINT_RACE', label: 'Sprint Race' },
  { id: 'GRAND_PRIX', label: 'Grand Prix' }
];

const formatInterval = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  
  const h = val.hours || 0;
  const m = val.minutes || 0;
  const s = val.seconds || 0;
  const ms = val.milliseconds || 0;

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
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeSession, setActiveSession] = useState('QUALIFYING');
  const [isPublishing, setIsPublishing] = useState(false);
  const [keepPointsOnDNF, setKeepPointsOnDNF] = useState(new Set()); // Track which drivers keep points despite DNF

  const { data: calendar = [], isLoading: calendarLoading } = useCalendarForPaddock();
  const { data: allDrivers = [], isLoading: driversLoading } = useDrivers();
  const { data: seasons = [] } = useSeasons();
  const { data: gridData, isLoading: gridLoading } = useStartingGrid(activeEvent, activeSession);
  const finalizeResultsMutation = useFinalizeResults();

  // Get dynamic points matrix from active season
  const activeSeason = seasons.find(s => s.is_active) || seasons[0];
  const pointsMatrix = activeSeason?.points_matrix || {
    race: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    sprint: [8, 7, 6, 5, 4, 3, 2, 1],
    fastest_lap: 1
  };

  // Initialize active event on first load
  React.useEffect(() => {
    if (calendar.length > 0 && !activeEvent) {
      const nextRace = calendar.find(e => !e.is_completed);
      if (nextRace) {
        setActiveEvent(nextRace.id);
      }
    }
  }, [calendar, activeEvent]);

  // Hydrate session data when activeEvent or activeSession changes
  React.useEffect(() => {
    if (!activeEvent || gridLoading) return;

    const hydrateSession = async () => {
      try {
        if (!gridData) return;

        // gridData is now { type: 'EXISTING' | 'AUTO_GRID' | 'EMPTY', data: [...], gridSourceSession?: '...' }
        const results = gridData.data || [];

        if (results.length > 0) {
          // Populate classification with existing results
          setClassification(
            results.map((d, idx) => ({
              ...d,
              position: d.position || idx + 1,
              is_dnf: d.is_dnf || false,
              fastest_lap: d.fastest_lap || false,
              best_lap_time: formatInterval(d.best_lap_time),
              total_race_time: formatInterval(d.total_race_time),
              grid_position: d.grid_position || null,
              points_awarded: d.points_awarded || 0
            }))
          );

          // Get ranked driver IDs
          const rankedIds = results.map(d => d.id);
          
          // Filter out already ranked drivers from available list
          const unrankedDrivers = filterAssignedDrivers(allDrivers).filter(
            d => !rankedIds.includes(d.id)
          );
          
          setAvailableDrivers(unrankedDrivers);
        } else {
          // No results found, start with empty classification
          setClassification([]);
          setAvailableDrivers(filterAssignedDrivers(allDrivers));
        }
      } catch (err) {
        console.error('Hydration error:', err);
        setClassification([]);
        setAvailableDrivers(filterAssignedDrivers(allDrivers));
      }
    };

    hydrateSession();
  }, [activeEvent, activeSession, gridData, allDrivers]);

  const filterAssignedDrivers = (drivers) => {
    return drivers.filter(d => d.team_id || d.current_team_id);
  };

  const getPointsPreview = (index, driver) => {
    let points = 0;
    const matrix = activeSession === 'GRAND_PRIX' ? pointsMatrix.race : pointsMatrix.sprint;
    
    if (matrix) {
      // Award points unless DNF and not overridden
      const shouldAwardPoints = !driver.is_dnf || keepPointsOnDNF.has(driver.id);
      if (shouldAwardPoints) {
        points = matrix[index] || 0;
        if (activeSession === 'GRAND_PRIX' && driver.fastest_lap && index < 10 && !driver.is_dnf) {
          points += pointsMatrix.fastest_lap || 1;
        }
      }
    }
    return points;
  };

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
    if (driver) {
      setAvailableDrivers([...availableDrivers, driver]);
      setClassification(classification.filter(d => d.id !== driverId));
    }
  };

  const updateField = (index, field, value) => {
    const updated = [...classification];
    updated[index][field] = value;
    setClassification(updated);
  };

  const toggleStatus = (index, field) => {
    const updated = [...classification];
    updated[index][field] = !updated[index][field];
    
    // If marking DNF, remove fastest lap
    if (field === 'is_dnf' && updated[index].is_dnf) {
      updated[index].fastest_lap = false;
    }
    
    setClassification(updated);
  };

  const toggleKeepPointsOnDNF = (driverId) => {
    const newSet = new Set(keepPointsOnDNF);
    if (newSet.has(driverId)) {
      newSet.delete(driverId);
    } else {
      newSet.add(driverId);
    }
    setKeepPointsOnDNF(newSet);
  };

  const handleFinalize = async () => {
    if (!activeEvent || classification.length === 0) {
      alert('No results to publish');
      return;
    }

    const sessionLabel = SESSIONS.find(s => s.id === activeSession)?.label;
    if (!window.confirm(`Publish ${sessionLabel} results?`)) return;

    setIsPublishing(true);
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
          fastest_lap: d.fastest_lap,
          keep_points_on_dnf: keepPointsOnDNF.has(d.id) // Include flag for points calculation
        }))
      };

      await finalizeResultsMutation.mutateAsync(payload);
      alert('Results published successfully!');
      
      // Redirect to paddock if it was the main race
      if (activeSession === 'GRAND_PRIX') {
        setTimeout(() => window.location.href = '/paddock', 500);
      } else {
        // Reset for next session
        setClassification([]);
        setAvailableDrivers(filterAssignedDrivers(allDrivers));
      }
    } catch (err) {
      alert('Error publishing results: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const currentEvent = calendar.find(e => e.id == activeEvent);
  const isSprintWeekend = currentEvent?.has_sprint === true || currentEvent?.has_sprint === 1;
  const isLoading = calendarLoading || driversLoading || gridLoading;

  if (isLoading) {
    return (
      <div className="p-8 text-white font-black italic uppercase">
        Scanning Paddock...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 text-white">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-900 pb-8">
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">Race Control</h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-2">Session Logistics</p>
        </div>

        <div className="flex gap-4">
          <select 
            value={activeEvent || ""} 
            onChange={(e) => setActiveEvent(parseInt(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 p-3 text-xs font-bold uppercase outline-none text-white cursor-pointer"
          >
            <option value="">Select Event...</option>
            {calendar.map(event => (
              <option key={event.id} value={event.id}>
                R{event.round_number}: {event.track_name}
              </option>
            ))}
          </select>

          <select 
            value={activeSession} 
            onChange={(e) => setActiveSession(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 p-3 text-f1-red text-xs font-bold uppercase outline-none cursor-pointer"
          >
            {SESSIONS.map(s => {
              if (s.id.includes('SPRINT') && !isSprintWeekend) return null;
              return (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              );
            })}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ENTRY LIST */}
        <div className="bg-[#0c0c0c] p-6 border border-zinc-900">
          <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-widest border-b border-zinc-900 pb-2 flex justify-between">
            <span>Entry List</span>
            <span>{availableDrivers.length} Available</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {availableDrivers.map(driver => (
              <button 
                key={driver.id} 
                onClick={() => rankDriver(driver)}
                className="bg-zinc-900 border-l-4 p-3 text-left border-zinc-800 hover:bg-zinc-800 transition-all text-white"
                style={{ borderLeftColor: driver.color_hex || '#27272a' }}
              >
                <p className="text-[8px] text-zinc-500 uppercase font-bold truncate">
                  {driver.team_name || 'Free Agent'}
                </p>
                <p className="font-black uppercase text-[11px] truncate">
                  {driver.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* CLASSIFICATION */}
        <div className="bg-[#0c0c0c] p-6 border border-zinc-900 shadow-2xl relative min-h-[500px] flex flex-col">
          <h3 className="text-[10px] font-black uppercase text-f1-red mb-6 tracking-widest border-b border-zinc-900 pb-2">
            Classification ({classification.length})
          </h3>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="classification">
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className={`space-y-1 flex-grow overflow-y-auto ${snapshot.isDraggingOver ? 'bg-zinc-900/20' : ''}`}
                >
                  {classification.map((driver, index) => (
                    <Draggable 
                      key={driver.id.toString()} 
                      draggableId={driver.id.toString()} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center bg-zinc-900/50 border border-zinc-800 h-14 pr-4 transition-all ${
                            snapshot.isDragging 
                              ? 'z-50 bg-zinc-800 border-f1-red scale-[1.01]' 
                              : ''
                          }`}
                        >
                          {/* Position */}
                          <div className="bg-zinc-800 w-10 h-full flex items-center justify-center font-black italic text-xs text-zinc-500">
                            P{index + 1}
                          </div>

                          {/* Team Color */}
                          <div 
                            className="w-1 h-full mx-3" 
                            style={{ backgroundColor: driver.color_hex || '#27272a' }} 
                          />

                          {/* Driver Info & Times */}
                          <div className="flex-grow min-w-0">
                            <div className="font-bold uppercase text-[11px] truncate flex items-center gap-2">
                              {driver.name}
                              {getPointsPreview(index, driver) > 0 && (
                                <span className="text-zinc-600 text-[9px] font-normal italic">
                                  +{getPointsPreview(index, driver)}
                                </span>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder={activeSession.includes('QUALIFYING') ? "QUALI TIME" : "BEST LAP"}
                              value={driver.best_lap_time || ''}
                              onChange={(e) => updateField(index, 'best_lap_time', e.target.value)}
                              className="bg-transparent text-[9px] text-zinc-500 outline-none w-full uppercase placeholder:text-zinc-800"
                            />
                          </div>

                          {/* Race Time (for race sessions) */}
                          {(activeSession === 'GRAND_PRIX' || activeSession === 'SPRINT_RACE') && (
                            <input
                              type="text"
                              placeholder={index === 0 ? "TOTAL TIME" : "+ GAP"}
                              value={driver.total_race_time || ''}
                              onChange={(e) => updateField(index, 'total_race_time', e.target.value)}
                              className="bg-zinc-950 border border-zinc-800 text-[10px] px-2 py-1 w-20 mx-2 text-right font-mono text-zinc-400 focus:border-f1-red outline-none"
                            />
                          )}

                          {/* Status Buttons */}
                          <div className="flex items-center gap-1">
                            {(activeSession === 'GRAND_PRIX' || activeSession === 'SPRINT_RACE') && (
                              <button
                                onClick={() => toggleStatus(index, 'fastest_lap')}
                                className={`w-7 h-7 text-[8px] font-black border transition-all ${
                                  driver.fastest_lap 
                                    ? 'bg-purple-600 border-purple-600 text-white' 
                                    : 'text-zinc-700 border-zinc-800 hover:text-white'
                                }`}
                                title="Fastest Lap"
                              >
                                FL
                              </button>
                            )}
                            <button
                              onClick={() => toggleStatus(index, 'is_dnf')}
                              className={`w-8 h-7 text-[8px] font-black border transition-all ${
                                driver.is_dnf 
                                  ? 'bg-zinc-700 border-zinc-700 text-white' 
                                  : 'text-zinc-700 border-zinc-800 hover:text-white'
                              }`}
                              title="Did Not Finish"
                            >
                              DNF
                            </button>
                            {driver.is_dnf && (
                              <button
                                onClick={() => toggleKeepPointsOnDNF(driver.id)}
                                className={`w-8 h-7 text-[8px] font-black border transition-all ${
                                  keepPointsOnDNF.has(driver.id) 
                                    ? 'bg-green-600 border-green-600 text-white' 
                                    : 'text-zinc-700 border-zinc-800 hover:text-white'
                                }`}
                                title="Keep points despite DNF"
                              >
                                +P
                              </button>
                            )}
                            <button
                              onClick={() => unrankDriver(driver.id)}
                              className="ml-1 text-zinc-800 hover:text-white p-1"
                              title="Remove from classification"
                            >
                              ✕
                            </button>
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

          {/* Publish Button */}
          {classification.length > 0 && (
            <div className="mt-8 pt-6 border-t border-zinc-900">
              <button
                onClick={handleFinalize}
                disabled={isPublishing}
                className="w-full bg-white text-black py-4 font-black italic uppercase hover:bg-f1-red hover:text-white transition-all tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : `Publish ${activeSession.replace('_', ' ')}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};