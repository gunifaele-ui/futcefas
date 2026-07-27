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
        open ? 'bg-fc-lime/20 border-fc-lime' : 'bg-fc-limesoft/70 border-fc-lime/40'
      }`}
    >
      {badge.count > 1 && (
        <span className="absolute -top-1.5 -right-1.5 bg-fc-dark text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          ×{badge.count}
        </span>
      )}
      <span className="text-[20px] leading-none">{badge.icon}</span>
      <span className="text-[10px] font-semibold text-fc-ink leading-tight">{badge.label}</span>
      {badge.detail && <span className="text-[9px] text-fc-ink/60 font-medium">{badge.detail}</span>}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-fc-cream rounded-lg px-1.5 py-2 text-center gap-0.5">
      <span className="text-fc-ink/50 font-medium text-[8.5px] uppercase tracking-wide truncate w-full">{label}</span>
      <span className="font-semibold text-fc-ink text-[13px] leading-tight">{value}</span>
    </div>
  );
}

export default function PlayerProfileModal({ player, badges, matchHistory, onClose }) {
  const [openBadgeId, setOpenBadgeId] = useState(null);

  const achievedBadges = badges.filter((b) => b.achieved && b.id !== 'estreante');
  const topBadge = getTopBadge(badges);
  const openBadge = achievedBadges.find((b) => b.id === openBadgeId) || null;

  const stats = useMemo(() => computeProfileStats(player.id, matchHistory), [player.id, matchHistory]);

  const awardEntries = [
    { key: 'campeao', label: 'Campeão do trimestre', count: stats.awards.campeao },
    { key: 'artilheiro', label: 'Artilheiro do trimestre', count: stats.awards.artilheiro },
    { key: 'garcom', label: 'Garçom do trimestre', count: stats.awards.garcom },
    { key: 'sempre_presente', label: 'Sempre presente', count: stats.awards.sempre_presente },
  ].filter((a) => a.count > 0);

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center gap-2.5 mb-4">
        <Avatar nome={player.nome} foto={player.foto} size="w-11 h-11" badge={topBadge} />
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-fc-ink truncate">{player.nome}</h3>
          <p className="text-[11px] text-fc-muted">
            {achievedBadges.length} {achievedBadges.length === 1 ? 'conquista' : 'conquistas'}
          </p>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto pb-1 space-y-4">
        <div>
          <h4 className="text-[11.5px] font-semibold text-fc-ink/70 uppercase tracking-wide mb-2">Estatísticas gerais</h4>
          <div className="grid grid-cols-3 gap-1.5">
            <StatCard label="Gols" value={stats.totals.gols} />
            <StatCard label="Assist." value={stats.totals.assistencias} />
            <StatCard label="Vitórias" value={stats.totals.vitorias} />
            <StatCard label="Presenças" value={stats.totals.presencas} />
            <StatCard label="Gols numa pelada" value={stats.maxGolsMatch} />
            <StatCard label="Seq. de presença" value={stats.maxAttendanceStreak} />
            <StatCard label="Seq. sem marcar" value={stats.maxDrySpell} />
            <StatCard label="Maior parceiro" value={stats.partner ? stats.partner.nome : '—'} />
            {stats.partner && <StatCard label="Jogos juntos" value={stats.partner.count} />}
          </div>
        </div>

        {awardEntries.length > 0 && (
          <div>
            <h4 className="text-[11.5px] font-semibold text-fc-ink/70 uppercase tracking-wide mb-2">Destaques do trimestre</h4>
            <div className="space-y-1.5">
              {awardEntries.map((a) => (
                <div key={a.key} className="flex items-center justify-between bg-fc-cream rounded-lg px-3 py-2">
                  <span className="text-[12px] font-medium text-fc-ink">{a.label}</span>
                  <span className="text-[12px] font-semibold text-fc-ink">
                    {a.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-[11.5px] font-semibold text-fc-ink/70 uppercase tracking-wide mb-2">Conquistas</h4>
          {achievedBadges.length === 0 ? (
            <p className="text-[12px] text-fc-muted">Ainda sem conquistas — continue jogando pra desbloquear!</p>
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
                <div className="mt-2 bg-fc-dark text-white text-[11.5px] leading-snug rounded-xl px-3 py-2.5">
                  <span className="font-semibold">{openBadge.label}:</span> {openBadge.description}
                </div>
              )}
            </>
          )}
        </div>
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
