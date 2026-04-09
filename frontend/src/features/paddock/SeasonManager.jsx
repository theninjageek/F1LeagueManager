import React, { useState, useEffect } from 'react';
import { useSeasons, useSeasonEvents, useCreateSeason, useAddEvent, useUpdateEvent, useDeleteEvent, useTracks, useUpdateSeason } from '../../hooks/usePaddock';


export const SeasonManager = () => {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isAddWeekendOpen, setIsAddWeekendOpen] = useState(false);
  const [isPointsOpen, setIsPointsOpen] = useState(false);
  const [showSeasonInput, setShowSeasonInput] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState("");

  const { data: seasons = [], isLoading: seasonsLoading } = useSeasons();
  // const { data: tracks = [], isLoading: tracksLoading } = useCalendarForPaddock();
  const { data: events = [], isLoading: eventsLoading } = useSeasonEvents(selectedSeason?.id);

  const createSeasonMutation = useCreateSeason();
  const updateSeasonMutation = useUpdateSeason();
  const addEventMutation = useAddEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  // Set first season as selected on load
  useEffect(() => {
    if (seasons.length > 0 && !selectedSeason) {
      setSelectedSeason(seasons[0]);
    }
  }, [seasons, selectedSeason]);

  const handleCreateSeason = async () => {
    if (!newSeasonName.trim()) {
      alert('Please enter a season name');
      return;
    }

    try {
      await createSeasonMutation.mutateAsync({
        name: newSeasonName,
        points_matrix: {
          race: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
          sprint: [8, 7, 6, 5, 4, 3, 2, 1]
        }
      });
      setNewSeasonName("");
      setShowSeasonInput(false);
    } catch (err) {
      alert("Error creating season: " + err.message);
    }
  };

  const sortedEvents = events.sort((a, b) => a.round_number - b.round_number);

  return (
    <div className="relative h-[calc(100vh-80px)] bg-[#050505] text-white flex overflow-hidden font-sans select-none">
      
      {/* SIDEBAR */}
      <div className="w-72 border-r border-zinc-900 flex flex-col bg-[#080808]">
        <div className="p-8 border-b border-zinc-900/50">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-6">Seasons</h2>
          {showSeasonInput ? (
            <div className="flex flex-col gap-2">
              <input
                autoFocus
                value={newSeasonName}
                onChange={(e) => setNewSeasonName(e.target.value)}
                placeholder="SEASON NAME..."
                className="bg-black border border-zinc-800 p-2 text-[10px] font-black uppercase outline-none focus:border-f1-red text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSeason()}
              />
              <div className="flex gap-1">
                <button
                  onClick={handleCreateSeason}
                  disabled={createSeasonMutation.isPending}
                  className="flex-grow bg-f1-red py-1 text-[9px] font-black uppercase text-white hover:bg-white hover:text-black disabled:opacity-50 transition-all"
                >
                  {createSeasonMutation.isPending ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowSeasonInput(false);
                    setNewSeasonName("");
                  }}
                  className="px-3 bg-zinc-800 py-1 text-[9px] font-black uppercase italic hover:bg-zinc-700"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSeasonInput(true)}
              className="w-full py-2 border border-zinc-800 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all text-zinc-400"
            >
              + New Season
            </button>
          )}
        </div>

        <div className="flex-grow overflow-y-auto">
          {seasonsLoading ? (
            <div className="p-4 text-zinc-500 text-xs">Loading seasons...</div>
          ) : (
            seasons.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSeason(s)}
                className={`w-full text-left px-8 py-4 text-[11px] font-black uppercase italic tracking-tight transition-all relative ${
                  selectedSeason?.id === s.id
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900/30'
                }`}
              >
                {selectedSeason?.id === s.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-f1-red shadow-[0_0_15px_rgba(255,24,1,0.5)]" />
                )}
                {s.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow overflow-y-auto p-12">
        {selectedSeason ? (
          <div className="max-w-6xl mx-auto">
            <header className="mb-16 flex justify-between items-start">
              <div>
                <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
                  {selectedSeason.name}
                </h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
                  {sortedEvents.length} Rounds Scheduled
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddWeekendOpen(true)}
                  className="px-6 py-2 border border-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  + Add Weekend
                </button>
                <button
                  onClick={() => setIsPointsOpen(true)}
                  className="px-6 py-2 border border-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Points Rules
                </button>
              </div>
            </header>

            {eventsLoading ? (
              <div className="text-zinc-500">Loading events...</div>
            ) : (
              <div className="grid gap-4">
                {sortedEvents.map(e => (
                  <div
                    key={e.id}
                    className="bg-[#0c0c0c] border border-zinc-900 flex items-center p-8 group relative overflow-hidden hover:bg-zinc-900/20 transition-colors"
                  >
                    <div className="w-24 border-r border-zinc-800 mr-8">
                      <span className="block text-[10px] font-black text-f1-red italic uppercase tracking-widest">Rnd</span>
                      <span className="text-5xl font-black italic leading-none">
                        {String(e.round_number).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none group-hover:text-f1-red transition-colors">
                        {e.track_name}
                      </h3>
                      <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-2">
                        {e.track_location}
                      </p>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right">
                        <span className="text-xs font-mono text-zinc-500 font-bold uppercase">
                          {new Date(e.weekend_start).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </span>
                        <div className="flex justify-end gap-2 mt-3">
                          {e.has_sprint && (
                            <span className="border border-f1-red text-f1-red text-[8px] font-black px-2 py-0.5 italic">
                              SPRINT
                            </span>
                          )}
                          {e.is_reverse && (
                            <span className="border border-yellow-500 text-yellow-500 text-[8px] font-black px-2 py-0.5 italic">
                              REVERSE
                            </span>
                          )}
                          {parseFloat(e.points_multiplier || 1) > 1 && (
                            <span className="border border-white text-white text-[8px] font-black px-2 py-0.5 italic">
                              {e.points_multiplier}X
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setEditingEvent(e)}
                        className="text-zinc-700 hover:text-f1-red transition-colors p-2"
                        title="Edit event"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {sortedEvents.length === 0 && (
                  <div className="text-center py-16 border border-dashed border-zinc-900">
                    <p className="text-zinc-600 text-sm">No races scheduled</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center opacity-5 select-none">
            <h2 className="text-[12rem] font-black italic uppercase tracking-tighter">Paddock</h2>
          </div>
        )}
      </div>

      {/* OVERLAYS */}
      {editingEvent && (
        <EngineerPanel
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdate={updateEventMutation}
          onDelete={deleteEventMutation}
        />
      )}
      
      {isAddWeekendOpen && (
        <AddWeekendPanel
          seasonId={selectedSeason?.id}
          onClose={() => setIsAddWeekendOpen(false)}
          onAddEvent={addEventMutation}
        />
      )}
      
      {isPointsOpen && (
        <PointsPanel
          season={selectedSeason}
          onClose={() => setIsPointsOpen(false)}
          onUpdate={updateSeasonMutation}
        />
      )}
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const EngineerPanel = ({ event, onClose, onUpdate, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const [localEvent, setLocalEvent] = useState(event);
    useEffect(() => {
      setLocalEvent(event);
    }, [event]);

  const handleUpdate = async (updates) => {
    try {
      await onUpdate.mutateAsync({ eventId: event.id, updates });
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this weekend from the calendar?")) return;
    setIsDeleting(true);
    try {
      await onDelete.mutateAsync(event.id);
      onClose();
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0c0c0c] border-l border-f1-red h-full p-10 pt-24 animate-slide-in shadow-2xl overflow-y-auto">
        <header className="flex justify-between items-start mb-12">
          <div>
            <span className="text-[10px] font-black text-f1-red uppercase tracking-[0.3em]">Engineer Tuning</span>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mt-1">{event.track_name}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl">
            ✕
          </button>
        </header>

        <div className="space-y-10">
          <section className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase">Start Date</label>
              <input
                type="date"
                defaultValue={event.weekend_start?.split('T')[0]}
                onChange={(e) => handleUpdate({ weekend_start: e.target.value })}
                className="bg-zinc-900 border border-zinc-700 p-3 text-xs font-bold outline-none focus:border-f1-red focus:border-2 text-white cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase">End Date</label>
              <input
                type="date"
                defaultValue={event.weekend_end?.split('T')[0]}
                onChange={(e) => handleUpdate({ weekend_end: e.target.value })}
                className="bg-zinc-900 border border-zinc-700 p-3 text-xs font-bold outline-none focus:border-f1-red focus:border-2 text-white cursor-pointer"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase italic">Weekend Flags</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const newVal = !localEvent.has_sprint;
                  setLocalEvent({ ...localEvent, has_sprint: newVal });
                  handleUpdate({ has_sprint: newVal });
                }}
                className={`p-4 border text-[10px] font-black italic uppercase transition-all ${
                  localEvent.has_sprint ? 'bg-f1-red text-white border-f1-red' : 'border-zinc-800 text-zinc-500 hover:text-white'
                }`}
              >
                Sprint
              </button>
              <button
                onClick={() => {
                  const newVal = !localEvent.is_reverse;
                  setLocalEvent({ ...localEvent, is_reverse: newVal });
                  handleUpdate({ is_reverse: newVal });
                }}
                className={`p-4 border text-[10px] font-black italic uppercase transition-all ${
                  localEvent.is_reverse ? 'bg-yellow-500 text-black border-yellow-500' : 'border-zinc-800 text-zinc-500 hover:text-white'
                }`}
              >
                Reverse
              </button>
            </div>
          </section>

          <section>
            <label className="text-[10px] font-black text-zinc-500 uppercase block mb-4 italic">Event Weighting</label>
            <div className="flex gap-2">
              {['1.0', '1.5', '2.0'].map(m => (
                <button
                  key={m}
                  onClick={() => {
                    const newVal = m;
                    setLocalEvent({ ...localEvent, points_multiplier: newVal });
                    handleUpdate({ points_multiplier: newVal });
                  }}
                  className={`flex-grow p-3 text-xs font-black border transition-all ${
                    parseFloat(localEvent.points_multiplier || 1) === parseFloat(m)
                      ? 'bg-white text-black border-white'
                      : 'border-zinc-800 text-zinc-500 hover:text-white'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>
          </section>

          <div className="pt-20 border-t border-zinc-900">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full text-zinc-800 hover:text-red-600 text-[10px] font-black uppercase tracking-[0.2em] transition-colors py-4 italic border border-zinc-800 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Weekend'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

const AddWeekendPanel = ({ seasonId, onClose, onAddEvent }) => {
  const today = new Date().toISOString().split('T')[0];
  const { data: allEvents = [] } = useSeasonEvents(seasonId);

  const [form, setForm] = useState({
    track_id: "",
    round_number: "",
    weekend_start: today,
    weekend_end: today,
    has_sprint: false,
    is_reverse: false
  });

  // Auto-populate round number
  useEffect(() => {
    const nextRound = allEvents.length > 0 
      ? Math.max(...allEvents.map(e => e.round_number)) + 1 
      : 1;
    setForm(prev => ({ ...prev, round_number: nextRound }));
  }, [allEvents]);

  const { data: tracks = [] } = useTracks();

  const handleSubmit = async () => {
    if (!form.track_id) {
      alert('Please select a track');
      return;
    }

    try {
      await onAddEvent.mutateAsync({
        seasonId,
        eventData: form
      });
      onClose();
    } catch (err) {
      alert("Error adding weekend: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0c0c0c] border-l border-white h-full p-10 pt-24 animate-slide-in shadow-2xl overflow-y-auto">
        <h2 className="text-3xl font-black italic uppercase mb-10 tracking-tighter">Add Race Weekend</h2>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">Select Circuit</label>
            <select
              value={form.track_id}
              onChange={e => setForm({...form, track_id: e.target.value})}
              className="w-full bg-black border border-zinc-800 p-4 text-xs font-black uppercase outline-none focus:border-f1-red text-white cursor-pointer"
            >
              <option value="">CHOOSE TRACK...</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.track_name || t.name} — {t.track_location || t.location}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">Round #</label>
              <input
                type="number"
                value={form.round_number}
                onChange={e => setForm({...form, round_number: parseInt(e.target.value) || ""})}
                className="w-full bg-black border border-zinc-800 p-4 text-xs font-black uppercase outline-none focus:border-f1-red text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">Layout</label>
              <button
                onClick={() => setForm({...form, is_reverse: !form.is_reverse})}
                className={`w-full p-4 border text-[10px] font-black italic uppercase transition-all ${
                  form.is_reverse
                    ? 'bg-yellow-500 text-black border-yellow-500'
                    : 'border-zinc-800 text-zinc-500 hover:text-white'
                }`}
              >
                {form.is_reverse ? 'REVERSE' : 'STANDARD'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">Start Date</label>
              <input
                type="date"
                value={form.weekend_start}
                onChange={e => setForm({...form, weekend_start: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 p-4 text-xs font-bold outline-none focus:border-f1-red focus:border-2 text-white cursor-pointer"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase block mb-2 italic">End Date</label>
              <input
                type="date"
                value={form.weekend_end}
                onChange={e => setForm({...form, weekend_end: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 p-4 text-xs font-bold outline-none focus:border-f1-red focus:border-2 text-white cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-zinc-900/30 border border-zinc-800">
            <input
              type="checkbox"
              id="has_sprint"
              checked={form.has_sprint}
              onChange={e => setForm({...form, has_sprint: e.target.checked})}
              className="cursor-pointer"
            />
            <label htmlFor="has_sprint" className="text-[10px] font-black text-zinc-400 uppercase cursor-pointer">
              Sprint Race Weekend
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={onAddEvent.isPending}
            className="w-full bg-white text-black py-4 font-black italic uppercase text-sm mt-10 hover:bg-f1-red hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {onAddEvent.isPending ? 'Adding...' : 'Commit to Calendar'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

const PointsPanel = ({ season, onClose, onUpdate }) => {
  const [matrix, setMatrix] = useState({
    race: season?.points_matrix?.race || [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
    sprint: season?.points_matrix?.sprint || [8, 7, 6, 5, 4, 3, 2, 1],
    fastest_lap: season?.points_matrix?.fastest_lap ?? 1
  });

  // Sync matrix when season data updates from API
  useEffect(() => {
    if (season?.points_matrix) {
      setMatrix({
        race: season.points_matrix.race || [25, 18, 15, 12, 10, 8, 6, 4, 2, 1],
        sprint: season.points_matrix.sprint || [8, 7, 6, 5, 4, 3, 2, 1],
        fastest_lap: season.points_matrix.fastest_lap ?? 1
      });
    }
  }, [season?.points_matrix]);

  const addPosition = (type) => {
    setMatrix({
      ...matrix,
      [type]: [...matrix[type], 0]
    });
  };

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

  const handleSave = async () => {
    try {
      await onUpdate.mutateAsync({
        seasonId: season.id,
        updates: { points_matrix: matrix }
      });
      onClose();
    } catch (err) {
      alert("Failed to update points: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0c0c0c] border-l border-white h-full p-10 pt-24 overflow-y-auto animate-slide-in">
        <h2 className="text-3xl font-black italic uppercase mb-2 tracking-tighter">Scoring Logic</h2>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-10 italic">
          Rewards structure for {season?.name}
        </p>

        {/* MAIN RACE */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
            <h3 className="text-[10px] font-black text-f1-red uppercase tracking-widest">Main Race</h3>
            <div className="flex gap-2">
              <button
                onClick={() => removePosition('race')}
                className="text-[9px] text-zinc-600 hover:text-white transition-colors"
              >
                REMOVE P{matrix.race.length}
              </button>
              <button
                onClick={() => addPosition('race')}
                className="text-[9px] text-f1-red hover:text-white transition-colors"
              >
                ＋ ADD POSITION
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {matrix.race.map((p, i) => (
              <div key={`race-${i}`} className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-zinc-600 uppercase italic">P{i+1}</span>
                <input
                  type="number"
                  value={p}
                  onChange={e => updatePoint('race', i, e.target.value)}
                  className="bg-black border border-zinc-800 p-3 text-center text-xs font-black outline-none focus:border-white text-white"
                />
              </div>
            ))}
          </div>
        </section>

        {/* SPRINT */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-900 pb-2">
            <h3 className="text-[10px] font-black text-f1-red uppercase tracking-widest">Sprint Race</h3>
            <button
              onClick={() => addPosition('sprint')}
              className="text-[9px] text-f1-red hover:text-white transition-colors"
            >
              ＋ ADD POSITION
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {matrix.sprint.map((p, i) => (
              <div key={`sprint-${i}`} className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-zinc-600 uppercase italic">P{i+1}</span>
                <input
                  type="number"
                  value={p}
                  onChange={e => updatePoint('sprint', i, e.target.value)}
                  className="bg-black border border-zinc-800 p-3 text-center text-xs font-black outline-none focus:border-white text-white"
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
              className="w-16 bg-black border border-zinc-700 p-2 text-center text-xs font-black outline-none focus:border-f1-red text-white"
            />
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={onUpdate.isPending}
          className="w-full bg-white text-black py-4 font-black italic uppercase text-sm hover:bg-f1-red hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {onUpdate.isPending ? 'Updating...' : 'Update Season Rules'}
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};