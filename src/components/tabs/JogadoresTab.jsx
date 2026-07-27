import { useMemo, useState } from 'react';
import Avatar from '../Avatar';
import { getTopBadge, computeCareerTotals } from '../../utils/badges';

const SORT_OPTIONS = [
  { key: 'nome', label: 'Nome' },
  { key: 'gols', label: 'Gols' },
  { key: 'assistencias', label: 'Assist.' },
  { key: 'vitorias', label: 'Vitórias' },
  { key: 'presencas', label: 'Presenças' },
];

export default function JogadoresTab({ players, matchHistory, badgesByPlayerId, onOpenProfile }) {
  const [sortMode, setSortMode] = useState('nome');

  const totalsById = useMemo(() => computeCareerTotals(matchHistory), [matchHistory]);

  const sortedList = useMemo(() => {
    const withStats = players.map((p) => ({
      player: p,
      totals: totalsById.get(p.id) || { gols: 0, assistencias: 0, presencas: 0, vitorias: 0 },
    }));

    if (sortMode === 'nome') {
      return withStats.sort((a, b) => a.player.nome.localeCompare(b.player.nome, 'pt-BR'));
    }
    return withStats.sort((a, b) => b.totals[sortMode] - a.totals[sortMode]);
  }, [players, totalsById, sortMode]);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-fc-surface border border-fc-line p-1 rounded-xl overflow-x-auto">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortMode(opt.key)}
            className={`flex-1 shrink-0 text-[11.5px] py-1.5 px-2 rounded-lg transition whitespace-nowrap ${
              sortMode === opt.key ? 'bg-fc-limesoft text-fc-ink font-semibold' : 'text-fc-muted font-medium'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {sortedList.map(({ player: p, totals }) => {
          const topBadge = getTopBadge(badgesByPlayerId?.get(p.id));
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpenProfile(p)}
              className="w-full bg-fc-surface rounded-xl px-2.5 py-2 flex items-center gap-2 border border-fc-line active:scale-[0.99] transition text-left"
            >
              <Avatar nome={p.nome} foto={p.foto} size="w-8 h-8" textSize="text-[9px]" />
              <span className="text-[13px] font-medium text-fc-ink break-words min-w-0 flex-1 flex items-center gap-1.5">
                {topBadge && (
                  <span title={topBadge.label} className="text-[14px] leading-none shrink-0">
                    {topBadge.icon}
                  </span>
                )}
                {p.nome}
              </span>
              {sortMode !== 'nome' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-fc-cream text-fc-ink/70">
                  {totals[sortMode]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
