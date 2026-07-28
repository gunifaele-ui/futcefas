import { useMemo, useState } from 'react';
import Avatar from '../Avatar';
import Icon from '../Icon';
import { getTopBadge, computeCareerTotals } from '../../utils/badges';

const SORT_OPTIONS = [
  { key: 'gols', label: 'Gols' },
  { key: 'assistencias', label: 'Assist.' },
  { key: 'vitorias', label: 'Vitórias' },
  { key: 'presencas', label: 'Presenças' },
  { key: 'nome', label: 'Nome' },
];

export default function JogadoresTab({ players, matchHistory, badgesByPlayerId, onOpenProfile }) {
  const [sortMode, setSortMode] = useState('gols');

  const totalsById = useMemo(() => computeCareerTotals(matchHistory), [matchHistory]);

  const sortedList = useMemo(() => {
    const withStats = players.filter((p) => p.posicaoFixa !== 'Goleiro').map((p) => ({
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
          const playerBadges = (badgesByPlayerId?.get(p.id) || []).filter((b) => b.achieved && b.id !== 'estreante');
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpenProfile(p)}
              className="w-full bg-fc-surface hover:bg-fc-cream/60 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xs active:scale-[0.99] transition text-left group"
            >
              <Avatar nome={p.nome} foto={p.foto} size="w-8 h-8" textSize="text-[9px]" />

              <span className="text-[13px] font-semibold text-fc-ink truncate flex-1 min-w-0 pr-2">
                {p.nome}
              </span>

              <div className="flex items-center gap-2 shrink-0 ml-auto">
                {playerBadges.length > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    {playerBadges.map((badge) => (
                      <span key={badge.id} title={`${badge.label}: ${badge.description}`} className="text-[14.5px] leading-none shrink-0">
                        {badge.icon}
                      </span>
                    ))}
                  </div>
                )}

                {sortMode !== 'nome' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-fc-cream text-fc-ink/80 border border-fc-line/40">
                    {totals[sortMode]}
                  </span>
                )}

                <span
                  title="Ampliar perfil"
                  className="text-[11px] font-semibold text-fc-ink/80 bg-fc-cream group-hover:bg-fc-limesoft px-2.5 py-1 rounded-lg border border-fc-line transition flex items-center gap-1 shrink-0"
                >
                  <Icon name="user" size={12} /> Ver perfil
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
