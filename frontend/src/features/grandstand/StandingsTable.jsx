export const StandingsTable = ({ data, title }) => {
  return (
    <div className="bg-[#111] p-6 border border-zinc-800 rounded-xl relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-f1-red/5 blur-[100px] -z-10" />
      
      <h2 className="text-xs font-black uppercase tracking-[0.4em] mb-8 text-zinc-500 border-l-2 border-f1-red pl-4">
        {title}
      </h2>
      
      <div className="space-y-3">
        {data.map((row, index) => (
          <div key={row.name} className="flex items-center bg-zinc-900/40 hover:bg-zinc-800 transition-all border border-zinc-800/50 group h-14">
            <div className={`w-14 h-full flex items-center justify-center font-black italic text-xl ${index === 0 ? 'text-yellow-500' : 'text-zinc-500'}`}>
              {index + 1}
            </div>
            
            <div className="w-1 h-8 group-hover:h-full transition-all" style={{ backgroundColor: row.color_hex }} />
            
            <div className="flex-grow px-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{row.team_name}</p>
                <p className="text-lg font-black uppercase italic tracking-tighter">{row.name}</p>
              </div>
              
              <div className="flex items-center gap-8">
                {/* Wins/Form placeholder from design */}
                {/* <div className="text-green-500 text-sm">▲</div> */}
                <div className="text-2xl font-black italic text-white min-w-[60px] text-right">
                  {row.total_points}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};