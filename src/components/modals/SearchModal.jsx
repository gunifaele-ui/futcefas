import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';

export default function SearchModal({ searchQuery, setSearchQuery, filteredList, onSelectPlayer, onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      <h3 className="font-black text-sm text-fc-dark mb-3">🔍 Acha alguém aí</h3>

      <input
        type="text"
        placeholder="Digite o nome..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-fc-cream border border-slate-200 rounded-2xl py-3 px-4 text-xs text-fc-dark focus:outline-none focus:border-fc-dark focus:ring-2 focus:ring-fc-lime/40 font-bold mb-3 transition"
        autoFocus
      />

      <div className="max-h-56 overflow-y-auto space-y-1.5 mb-4">
        {filteredList.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Nenhum atleta encontrado.</p>
        ) : (
          filteredList.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPlayer(p.id)}
              className="p-2.5 rounded-xl bg-fc-cream border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-fc-limesoft/40 transition gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar nome={p.nome} foto={p.foto} size="w-7 h-7" textSize="text-[9px]" />
                <span className="text-xs font-bold text-fc-dark break-words min-w-0">{p.nome}</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${p.statusPresenca ? 'bg-fc-limesoft text-fc-dark' : 'bg-slate-200 text-slate-500'}`}>
                {p.statusPresenca ? 'Vai' : 'Não vai'}
              </span>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-full text-xs transition"
      >
        Fechar
      </button>
    </BottomSheet>
  );
}
