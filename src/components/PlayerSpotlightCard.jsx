import { useState } from 'react';
import Icon from './Icon';
import GamePhoto from './GamePhoto';
import Avatar from './Avatar';
import BottomSheet from './BottomSheet';

const TONES = {
  coral: 'bg-fc-coral text-white',
  dark: 'bg-fc-dark text-white',
};

const MAX_SPLIT = 5;

function TiedBadgeChip({ badgeIcon, badgeLabel, mainValue, mainUnit, chip }) {
  return (
    <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1 z-10">
      <span className={`flex items-center gap-1 rounded-full pl-1.5 pr-2 py-1 text-[8.5px] font-bold uppercase tracking-wide shadow min-w-0 ${chip}`}>
        <Icon name={badgeIcon} size={9} className="shrink-0" />
        <span className="truncate">{badgeLabel}</span>
      </span>
      <div className={`shrink-0 rounded-xl px-2 py-1 text-center leading-none shadow ${chip}`}>
        <p className="text-[15px] font-extrabold leading-none">{mainValue}</p>
        <p className="text-[6.5px] font-semibold uppercase tracking-wide leading-none mt-0.5">{mainUnit}</p>
      </div>
    </div>
  );
}

function TiedOverflowModal({ players, onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[14px] font-semibold text-fc-dark mb-3">Empate entre {players.length} jogadores</h3>
      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
        {players.map((p) => (
          <div key={p.id || p.nome} className="flex items-center gap-2.5 bg-fc-cream rounded-xl px-2.5 py-2">
            <Avatar nome={p.nome} foto={p.foto} size="w-8 h-8" textSize="text-[9px]" />
            <span className="text-[13px] font-medium text-fc-dark truncate">{p.nome}</span>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

function TiedSpotlightCard({ badgeIcon, badgeLabel, tone, players, mainValue, mainUnit }) {
  const chip = TONES[tone] || TONES.dark;
  const [showAll, setShowAll] = useState(false);
  const shown = players.slice(0, MAX_SPLIT);
  const extra = players.length - shown.length;

  return (
    <div className="bg-white rounded-2xl border border-fc-line shadow-card overflow-hidden">
      <div className="relative aspect-[3/4] bg-fc-cream">
        <TiedBadgeChip badgeIcon={badgeIcon} badgeLabel={badgeLabel} mainValue={mainValue} mainUnit={mainUnit} chip={chip} />
        <div className="absolute inset-0 pt-9 pb-2 px-2 grid grid-cols-2 gap-1.5 auto-rows-fr">
          {shown.map((p, i) => {
            const isLastOdd = i === shown.length - 1 && shown.length % 2 === 1 && extra === 0;
            return (
              <div
                key={p.id || p.nome}
                className={`rounded-xl bg-white border border-fc-line flex flex-col items-center justify-center gap-1 p-1 min-w-0 ${
                  isLastOdd ? 'col-span-2' : ''
                }`}
              >
                <Avatar nome={p.nome} foto={p.foto} size="w-9 h-9" textSize="text-[9px]" />
                <span className="text-[9.5px] font-semibold text-fc-dark text-center leading-tight truncate w-full px-0.5">{p.nome}</span>
              </div>
            );
          })}
          {extra > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="rounded-xl bg-fc-cream border border-fc-line flex items-center justify-center text-[13px] font-bold text-fc-dark/60 active:scale-95 transition"
            >
              +{extra}
            </button>
          )}
        </div>
      </div>
      <div className="p-2.5 text-center">
        <p className="text-[11px] text-fc-muted">Empate entre {players.length} jogadores</p>
      </div>
      {showAll && <TiedOverflowModal players={players} onClose={() => setShowAll(false)} />}
    </div>
  );
}

export default function PlayerSpotlightCard({ badgeIcon, badgeLabel, tone = 'dark', player, tiedPlayers, mainValue, mainUnit, stats, emptyText }) {
  const chip = TONES[tone] || TONES.dark;

  if (tiedPlayers && tiedPlayers.length > 1) {
    return (
      <TiedSpotlightCard
        badgeIcon={badgeIcon}
        badgeLabel={badgeLabel}
        tone={tone}
        players={tiedPlayers}
        mainValue={mainValue}
        mainUnit={mainUnit}
      />
    );
  }

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
        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1">
          <span className={`flex items-center gap-1 rounded-full pl-1.5 pr-2 py-1 text-[8.5px] font-bold uppercase tracking-wide shadow min-w-0 ${chip}`}>
            <Icon name={badgeIcon} size={9} className="shrink-0" />
            <span className="truncate">{badgeLabel}</span>
          </span>
          <div className={`shrink-0 rounded-xl px-2 py-1 text-center leading-none shadow ${chip}`}>
            <p className="text-[15px] font-extrabold leading-none">{mainValue}</p>
            <p className="text-[6.5px] font-semibold uppercase tracking-wide leading-none mt-0.5">{mainUnit}</p>
          </div>
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
