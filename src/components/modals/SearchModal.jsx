import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';
import { getTopBadge } from '../../utils/badges';

export default function SearchModal({ searchQuery, setSearchQuery, filteredList, badgesByPlayerId, onSelectPlayer, onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-fc-ink mb-3 flex items-center gap-2">
        <Icon name="search" size={16} className="text-fc-ink/60" /> Acha alguém aí
      </h3>

      <input
        type="text"
        placeholder="Digite o nome..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-fc-cream border border-fc-line rounded-xl py-3 px-4 text-[13px] text-fc-ink placeholder:text-fc-muted focus:outline-none focus:border-fc-ink/30 focus:bg-fc-surface font-medium mb-3 transition"
        autoFocus
      />

      <div className="max-h-56 overflow-y-auto space-y-1.5 mb-4">
        {filteredList.length === 0 ? (
          <p className="text-[12px] text-fc-muted text-center py-6">Nenhum atleta encontrado.</p>
        ) : (
          filteredList.map((p) => {
            const topBadge = getTopBadge(badgesByPlayerId?.get(p.id));
            return (
              <div
                key={p.id}
                onClick={() => onSelectPlayer(p.id)}
                className="p-2.5 rounded-xl bg-fc-surface border border-fc-line flex justify-between items-center cursor-pointer hover:bg-fc-cream transition gap-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Avatar nome={p.nome} foto={p.foto} size="w-7 h-7" textSize="text-[9px]" />
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[13px] font-medium text-fc-ink truncate">{p.nome}</span>
                    {topBadge && (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="w-px h-3.5 bg-fc-line/60 shrink-0" />
                        <span title={topBadge.label} className="text-[14px] leading-none shrink-0">
                          {topBadge.icon}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    p.statusPresenca ? 'bg-fc-limesoft text-fc-ink' : 'bg-fc-cream text-fc-muted'
                  }`}
                >
                  {p.statusPresenca ? 'Vai' : 'Não vai'}
                </span>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full bg-fc-cream hover:bg-fc-line text-fc-ink/70 font-medium py-3 rounded-xl text-[13px] transition"
      >
        Fechar
      </button>
    </BottomSheet>
  );
}
