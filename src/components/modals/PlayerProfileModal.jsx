import { useState } from 'react';
import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';
import { getTopBadge } from '../../utils/badges';

function BadgeTile({ badge }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className={`w-full rounded-xl p-2.5 border flex flex-col items-center text-center gap-1 ${
          badge.achieved ? 'bg-fc-limesoft/70 border-fc-lime/40' : 'bg-fc-cream border-fc-line opacity-60'
        }`}
      >
        {badge.achieved && badge.count > 1 && (
          <span className="absolute -top-1.5 -right-1.5 bg-fc-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
            ×{badge.count}
          </span>
        )}
        <span className={`text-[20px] leading-none ${badge.achieved ? '' : 'grayscale'}`}>{badge.icon}</span>
        <span className="text-[10px] font-semibold text-fc-ink leading-tight">{badge.label}</span>
        {badge.achieved && badge.detail && <span className="text-[9px] text-fc-ink/60 font-medium">{badge.detail}</span>}
      </button>
      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-10 w-40 bg-fc-dark text-white text-[10.5px] leading-snug rounded-lg px-2.5 py-2 shadow-lg">
          {badge.description}
        </span>
      )}
    </div>
  );
}

export default function PlayerProfileModal({ player, badges, onClose }) {
  const visibleBadges = badges.filter((b) => b.id !== 'estreante');
  const achievedCount = visibleBadges.filter((b) => b.achieved).length;
  const topBadge = getTopBadge(badges);

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center gap-2.5 mb-1">
        <Avatar nome={player.nome} foto={player.foto} size="w-11 h-11" badge={topBadge} />
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-fc-ink truncate">{player.nome}</h3>
          <p className="text-[11px] text-fc-muted">
            {achievedCount} de {visibleBadges.length} conquistas
          </p>
        </div>
      </div>
      <p className="text-[12px] text-fc-muted mb-4 leading-relaxed">
        Conquistas calculadas a partir do histórico de peladas. Coloridas = já desbloqueadas, cinza = ainda travadas. Toque numa conquista pra ver o que ela significa.
      </p>

      <div className="grid grid-cols-3 gap-2 max-h-[55vh] overflow-y-auto pb-1">
        {visibleBadges.map((badge) => (
          <BadgeTile key={badge.id} badge={badge} />
        ))}
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-fc-cream hover:bg-fc-line text-fc-ink/70 font-medium py-3 rounded-xl text-[13px] transition"
        >
          Fechar
        </button>
      </div>
    </BottomSheet>
  );
}
