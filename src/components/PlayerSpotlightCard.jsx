import Icon from './Icon';
import GamePhoto from './GamePhoto';

const TONES = {
  coral: 'bg-fc-coral text-white',
  dark: 'bg-fc-dark text-white',
};

export default function PlayerSpotlightCard({ badgeIcon, badgeLabel, tone = 'dark', player, mainValue, mainUnit, stats, emptyText }) {
  const chip = TONES[tone] || TONES.dark;

  if (!player) {
    return (
      <div className="bg-white rounded-2xl border border-fc-line shadow-card overflow-hidden flex flex-col">
        <div className="aspect-[3/4] bg-fc-cream flex items-center justify-center">
          <Icon name={badgeIcon} size={22} className="text-fc-dark/15" />
        </div>
        <div className="p-2.5 text-center">
          <p className="text-[9.5px] font-bold text-fc-muted uppercase tracking-wide">{badgeLabel}</p>
          <p className="text-[11px] text-fc-muted mt-1">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-fc-line shadow-card overflow-hidden">
      <div className="relative aspect-[3/4]">
        <GamePhoto nome={player.nome} fotoJogo={player.fotoJogo} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
        <span className={`absolute top-2 left-2 flex items-center gap-1 rounded-full pl-1.5 pr-2 py-1 text-[8.5px] font-bold uppercase tracking-wide shadow ${chip}`}>
          <Icon name={badgeIcon} size={9} /> {badgeLabel}
        </span>
        <div className={`absolute top-2 right-2 rounded-xl px-2 py-1 text-center leading-none shadow ${chip}`}>
          <p className="text-[15px] font-extrabold leading-none">{mainValue}</p>
          <p className="text-[6.5px] font-semibold uppercase tracking-wide leading-none mt-0.5">{mainUnit}</p>
        </div>
        <div className="absolute bottom-0 inset-x-0 p-2.5">
          <p className="text-white text-[13px] font-extrabold uppercase leading-tight tracking-tight break-words">{player.nome}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-2 text-[10px]">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center justify-center bg-fc-cream rounded-lg px-1.5 py-1.5 text-center">
            <span className="text-fc-dark/50 font-medium text-[8.5px] uppercase tracking-wide truncate w-full">{s.label}</span>
            <span className="font-semibold text-fc-dark text-[11px] leading-tight">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
