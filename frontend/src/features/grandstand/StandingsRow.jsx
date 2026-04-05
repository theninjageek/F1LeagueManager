export const StandingsRow = ({ driver, rank, isConstructor }) => (
  <div className="group flex items-center bg-[#151515] h-14 border border-transparent hover:border-zinc-700 transition-colors cursor-default overflow-hidden">
    {/* Rank Section */}
    <div className={`w-12 h-full flex items-center justify-center font-black italic text-lg ${rank === 1 ? 'bg-f1-red text-white' : 'bg-zinc-800 text-zinc-400'}`}>
      {rank}
    </div>

    {/* Team Accent Color */}
    <div className="w-1.5 h-full" style={{ backgroundColor: driver.color_hex }} />

    {/* Driver/Team Info */}
    <div className="flex-grow flex items-center justify-between px-6">
      <div className="flex flex-col justify-center">
        <p className="font-black uppercase italic text-lg tracking-tight leading-none group-hover:text-f1-red transition-colors">
          {driver.name}
        </p>
        {!isConstructor && (
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
            {driver.team_name}
          </p>
        )}
      </div>

      {/* Stats Container */}
      <div className="flex items-center gap-10">
        {/* Wins (Optional/Small) */}
        <div className="hidden sm:block text-center w-12">
          <p className="text-[8px] text-zinc-600 font-black uppercase leading-none mb-1">Wins</p>
          <p className="font-bold text-sm text-zinc-400">{driver.wins || 0}</p>
        </div>

        {/* Total Points */}
        <div className="w-16 text-right">
          <p className="text-[8px] text-zinc-600 font-black uppercase leading-none mb-1">PTS</p>
          <p className="text-2xl font-black italic leading-none">
            {driver.total_points !== undefined ? driver.total_points : 0}
          </p>
        </div>
      </div>
    </div>
  </div>
);