import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

export default function SearchModal({ searchQuery, setSearchQuery, filteredList, onSelectPlayer, onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-fc-dark mb-3 flex items-center gap-2">
        <Icon name="search" size={16} className="text-fc-dark/60" /> Acha alguém aí
      </h3>

      <input
        type="text"
        placeholder="Digite o nome..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-fc-cream border border-fc-line rounded-xl py-3 px-4 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium mb-3 transition"
        autoFocus
      />

      <div className="max-h-56 overflow-y-auto space-y-1.5 mb-4">
        {filteredList.length === 0 ? (
          <p className="text-[12px] text-fc-muted text-center py-6">Nenhum atleta encontrado.</p>
        ) : (
          filteredList.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectPlayer(p.id)}
              className="p-2.5 rounded-xl bg-white border border-fc-line flex justify-between items-center cursor-pointer hover:bg-fc-cream transition gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar nome={p.nome} foto={p.foto} size="w-7 h-7" textSize="text-[9px]" />
                <span className="text-[13px] font-medium text-fc-dark break-words min-w-0">{p.nome}</span>
              </div>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  p.statusPresenca ? 'bg-fc-limesoft text-fc-dark' : 'bg-fc-cream text-fc-muted'
                }`}
              >
                {p.statusPresenca ? 'Vai' : 'Não vai'}
              </span>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full bg-fc-cream hover:bg-fc-line text-fc-dark/70 font-medium py-3 rounded-xl text-[13px] transition"
      >
        Fechar
      </button>
    </BottomSheet>
  );
}
