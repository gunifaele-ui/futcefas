import { useMemo, useState } from 'react';
import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';
import { getTopBadge, computeProfileStats } from '../../utils/badges';

function BadgeTile({ badge, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-full rounded-xl p-2.5 border flex flex-col items-center text-center gap-1 transition ${
        open ? 'bg-fc-lime/25 border-fc-lime shadow-sm' : 'bg-fc-limesoft/70 border-fc-lime/40 hover:bg-fc-limesoft'
      }`}
    >
      {badge.count > 1 && (
        <span className="absolute -top-1.5 -right-1.5 bg-fc-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow">
          ×{badge.count}
        </span>
      )}
      <span className="text-[22px] leading-none">{badge.icon}</span>
      <span className="text-[10px] font-semibold text-fc-ink leading-tight">{badge.label}</span>
      {badge.detail && <span className="text-[9px] text-fc-ink/70 font-medium">{badge.detail}</span>}
    </button>
  );
}

function StatCard({ label, value, subtext }) {
  return (
    <div className="flex flex-col items-center justify-center bg-fc-cream rounded-xl px-2 py-2 text-center gap-0.5 border border-fc-line/40">
      <span className="text-fc-ink/50 font-semibold text-[8.5px] uppercase tracking-wide truncate w-full">{label}</span>
      <span className="font-bold text-fc-ink text-[13.5px] leading-tight">{value}</span>
      {subtext && <span className="text-[9px] text-fc-muted font-medium">{subtext}</span>}
    </div>
  );
}

const AWARD_ICONS = {
  campeao: '🏆',
  artilheiro: '⚽',
  garcom: '🎯',
  sempre_presente: '📅',
};

export default function PlayerProfileModal({ player, badges = [], matchHistory = [], onClose }) {
  const [openBadgeId, setOpenBadgeId] = useState(null);

  // All hooks must run unconditionally — early return is AFTER all hooks
  const safePlayer = player || {};
  const isGoleiro = safePlayer.posicaoFixa === 'Goleiro';

  const achievedBadges = useMemo(
    () => (Array.isArray(badges) ? badges.filter((b) => b?.achieved && b?.id !== 'estreante') : []),
    [badges]
  );
  const topBadge = useMemo(() => getTopBadge(badges), [badges]);
  const openBadge = useMemo(
    () => achievedBadges.find((b) => b?.id === openBadgeId) || null,
    [achievedBadges, openBadgeId]
  );

  const stats = useMemo(
    () => safePlayer.id ? computeProfileStats(safePlayer.id, matchHistory || [], isGoleiro) : null,
    [safePlayer.id, matchHistory, isGoleiro]
  );

  const safeStats = stats || {
    totals: { gols: 0, assistencias: 0, presencas: 0, vitorias: 0, pctVitorias: 0 },
    maxGolsMatch: 0,
    maxDrySpell: 0,
    maxAttendanceStreak: 0,
    partner: null,
    awards: { campeao: 0, artilheiro: 0, garcom: 0, sempre_presente: 0, total: 0 },
  };

  const awardEntries = useMemo(() => [
    { key: 'campeao', label: 'Campeão do trimestre', count: safeStats.awards?.campeao || 0 },
    { key: 'artilheiro', label: 'Artilheiro do trimestre', count: safeStats.awards?.artilheiro || 0 },
    { key: 'garcom', label: 'Garçom do trimestre', count: safeStats.awards?.garcom || 0 },
    { key: 'sempre_presente', label: 'Sempre presente', count: safeStats.awards?.sempre_presente || 0 },
  ].filter((a) => a.count > 0), [safeStats]);

  // Early return AFTER all hooks
  if (!player) return null;

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center gap-3 mb-4 border-b border-fc-line/60 pb-3">
        <Avatar nome={player.nome} foto={player.foto} size="w-12 h-12" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-bold text-fc-ink truncate flex items-center gap-2">
            <span className="truncate">{player.nome}</span>
            {topBadge && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-px h-4 bg-fc-line/60 shrink-0" />
                <span title={topBadge.label} className="text-[18px] leading-none shrink-0">
                  {topBadge.icon}
                </span>
              </div>
            )}
          </h3>
          <p className="text-[11px] text-fc-muted font-medium flex items-center gap-2 mt-0.5">
            <span>{player.posicaoFixa === 'Goleiro' ? 'Goleiro' : player.tipo || 'Mensalista'}</span>
            <span>•</span>
            <span>{achievedBadges.length} {achievedBadges.length === 1 ? 'conquista' : 'conquistas'}</span>
          </p>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto pb-2 space-y-4 pr-0.5">
        <div>
          <h4 className="text-[11px] font-bold text-fc-ink/60 uppercase tracking-wider mb-2">Estatísticas Gerais</h4>
          <div className="grid grid-cols-4 gap-1.5">
            <StatCard label="Gols" value={safeStats.totals.gols} />
            <StatCard label="Assist." value={safeStats.totals.assistencias} />
            <StatCard label="Vitórias" value={safeStats.totals.vitorias} subtext={`${safeStats.totals.pctVitorias}%`} />
            <StatCard label="Presenças" value={safeStats.totals.presencas} />
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-fc-ink/60 uppercase tracking-wider mb-2">Recordes e Marcas</h4>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-fc-surface border border-fc-line rounded-xl p-2.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-fc-coral/10 text-fc-coral flex items-center justify-center text-[16px] shrink-0">⚽</span>
              <div className="min-w-0 flex-1">
                <p className="text-[9.5px] font-semibold text-fc-muted uppercase tracking-wide truncate">Mais gols num dia</p>
                <p className="text-[13px] font-bold text-fc-ink leading-tight">{safeStats.maxGolsMatch} {safeStats.maxGolsMatch === 1 ? 'gol' : 'gols'}</p>
              </div>
            </div>

            <div className="bg-fc-surface border border-fc-line rounded-xl p-2.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center text-[16px] shrink-0">🔥</span>
              <div className="min-w-0 flex-1">
                <p className="text-[9.5px] font-semibold text-fc-muted uppercase tracking-wide truncate">Seq. de presença</p>
                <p className="text-[13px] font-bold text-fc-ink leading-tight">{safeStats.maxAttendanceStreak} {safeStats.maxAttendanceStreak === 1 ? 'pelada' : 'peladas'}</p>
              </div>
            </div>

            <div className="bg-fc-surface border border-fc-line rounded-xl p-2.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center text-[16px] shrink-0">🧊</span>
              <div className="min-w-0 flex-1">
                <p className="text-[9.5px] font-semibold text-fc-muted uppercase tracking-wide truncate">Seq. sem marcar</p>
                <p className="text-[13px] font-bold text-fc-ink leading-tight">{isGoleiro ? '—' : `${safeStats.maxDrySpell} ${safeStats.maxDrySpell === 1 ? 'jogo' : 'jogos'}`}</p>
              </div>
            </div>

            <div className="bg-fc-surface border border-fc-line rounded-xl p-2.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[16px] shrink-0">🤝</span>
              <div className="min-w-0 flex-1">
                <p className="text-[9.5px] font-semibold text-fc-muted uppercase tracking-wide truncate">Maior parceiro</p>
                <p className="text-[12.5px] font-bold text-fc-ink leading-tight truncate">
                  {safeStats.partner ? `${safeStats.partner.nome}` : '—'}
                </p>
                {safeStats.partner && <p className="text-[9.5px] text-fc-muted font-medium">{safeStats.partner.count} jogos juntos</p>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-bold text-fc-ink/60 uppercase tracking-wider">Destaques do Trimestre</h4>
            {(safeStats.awards?.total || 0) > 0 && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300/60">
                ⭐ {safeStats.awards.total} {safeStats.awards.total === 1 ? 'título' : 'títulos'}
              </span>
            )}
          </div>
          {awardEntries.length === 0 ? (
            <p className="text-[11.5px] text-fc-muted bg-fc-surface border border-fc-line rounded-xl px-3 py-2.5 text-center font-medium">
              Ainda não possui destaques trimestrais.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {awardEntries.map((a) => (
                <div key={a.key} className="flex items-center justify-between bg-fc-cream border border-fc-line/50 rounded-xl px-3 py-2">
                  <span className="text-[12px] font-medium text-fc-ink flex items-center gap-1.5">
                    <span>{AWARD_ICONS[a.key]}</span> {a.label}
                  </span>
                  <span className="text-[12px] font-bold text-fc-ink bg-fc-surface px-2 py-0.5 rounded-lg border border-fc-line/60">
                    {a.count}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-[11px] font-bold text-fc-ink/60 uppercase tracking-wider mb-2">
            Conquistas Desbloqueadas ({achievedBadges.length})
          </h4>
          {achievedBadges.length === 0 ? (
            <p className="text-[11.5px] text-fc-muted bg-fc-surface border border-fc-line rounded-xl px-3 py-2.5 text-center font-medium">
              Ainda sem insígnias desbloqueadas — continue jogando pra conquistar!
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {achievedBadges.map((badge) => (
                  <BadgeTile
                    key={badge.id}
                    badge={badge}
                    open={openBadgeId === badge.id}
                    onToggle={() => setOpenBadgeId((v) => (v === badge.id ? null : badge.id))}
                  />
                ))}
              </div>
              {openBadge && (
                <div className="mt-2.5 bg-fc-dark text-white text-[12px] leading-relaxed rounded-xl p-3 shadow-md border border-white/10 break-words">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[20px] leading-none">{openBadge.icon}</span>
                    <span className="font-bold text-[13px] text-white">{openBadge.label}</span>
                  </div>
                  <p className="text-white/85 text-[11.5px] leading-snug">{openBadge.description}</p>
                  {openBadge.detail && (
                    <p className="mt-2 text-[10.5px] font-semibold text-fc-lime bg-white/10 rounded-lg px-2.5 py-1 inline-block">
                      Status: {openBadge.detail}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-fc-line/60">
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-fc-cream hover:bg-fc-line text-fc-ink font-semibold py-3 rounded-xl text-[13px] transition"
        >
          Fechar
        </button>
      </div>
    </BottomSheet>
  );
}
