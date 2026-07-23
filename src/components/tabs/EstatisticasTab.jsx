import { useMemo, useState } from 'react';
import Icon from '../Icon';
import ResultChip from '../ResultChip';
import PlayerSpotlightCard from '../PlayerSpotlightCard';

const INITIAL_COUNT = 1;
const PAGE_SIZE = 5;
const INSIGHT_SIZE = 3;
const RANKING_LIMIT = 5;

function toDateInputValue(isoDate) {
  return isoDate.slice(0, 10);
}

function teamResultCount(match, team, type) {
  if (typeof team[type] === 'number') return team[type];
  if (type === 'vitorias' && match.winners?.includes(team.id)) return 1;
  return 0;
}

function isSameMonth(isoDate, ref) {
  const d = new Date(isoDate);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function pct(count, total) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="w-3.5 h-3.5 rounded-full border border-fc-dark/25 text-fc-dark/40 flex items-center justify-center text-[9px] font-semibold leading-none shrink-0"
      >
        i
      </button>
      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-10 w-52 bg-fc-dark text-white text-[11px] leading-snug rounded-lg px-2.5 py-2 shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}

function StatCard({ icon, title, info, children }) {
  return (
    <div className="bg-white rounded-2xl p-3.5 border border-fc-line shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <Icon name={icon} size={14} className="text-fc-dark/50" />
        <h3 className="text-[12.5px] font-semibold text-fc-dark">{title}</h3>
        {info && <InfoTooltip text={info} />}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ children }) {
  return <p className="text-[12px] text-fc-muted text-center py-3">{children}</p>;
}

const BAR_TONES = {
  warm: 'bg-fc-coral',
  dark: 'bg-fc-dark/70',
  accent: 'bg-fc-lime',
  neutral: 'bg-fc-muted',
};

const CHIP_TONES = {
  warm: 'text-fc-coraldark bg-orange-50',
  dark: 'text-fc-dark bg-fc-cream',
  accent: 'text-fc-dark bg-fc-limesoft',
  neutral: 'text-fc-dark/70 bg-fc-cream',
};

function RankRow({ position, label, valueLabel, pct, tone = 'neutral' }) {
  return (
    <div className="py-1.25">
      <div className="flex justify-between items-center text-[12.5px] gap-2 mb-1">
        <span className="font-medium text-fc-dark min-w-0 truncate">
          {position != null && <span className="text-fc-muted mr-1.5">{position}º</span>}
          {label}
        </span>
        <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${CHIP_TONES[tone]}`}>{valueLabel}</span>
      </div>
      {pct != null && (
        <div className="h-1 rounded-full bg-fc-line overflow-hidden">
          <div className={`h-full rounded-full ${BAR_TONES[tone]}`} style={{ width: `${Math.max(pct, 6)}%` }} />
        </div>
      )}
    </div>
  );
}

function RankingCard({ icon, title, info, entries, tone, emptyText, limit = RANKING_LIMIT }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, limit);
  const max = entries[0]?.value || 1;

  return (
    <StatCard icon={icon} title={title} info={info}>
      {entries.length === 0 ? (
        <EmptyState>{emptyText}</EmptyState>
      ) : (
        <>
          {visible.map((e, i) => (
            <RankRow key={e.label} position={i + 1} label={e.label} valueLabel={e.valueLabel} pct={(e.value / max) * 100} tone={tone} />
          ))}
          {entries.length > limit && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="w-full text-[11px] font-medium text-fc-dark/50 hover:text-fc-dark pt-1.5 text-center"
            >
              {expanded ? 'Ver menos' : `Ver mais (+${entries.length - limit})`}
            </button>
          )}
        </>
      )}
    </StatCard>
  );
}

function LeaderTile({ icon, label, name, value, tone }) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-fc-line shadow-card flex items-center gap-2.5 min-w-0">
      <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${tone}`}>
        <Icon name={icon} size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[9.5px] font-medium text-fc-muted uppercase tracking-wide truncate">{label}</p>
        {name ? (
          <>
            <p className="text-[12.5px] font-semibold text-fc-dark truncate leading-tight">{name}</p>
            <p className="text-[10px] text-fc-dark/50 font-medium">{value}</p>
          </>
        ) : (
          <p className="text-[11px] text-fc-muted mt-0.5">Sem dados</p>
        )}
      </div>
    </div>
  );
}

export default function EstatisticasTab({
  matchHistory,
  players,
  isAdmin,
  isViewer,
  onRequestDeleteMatch,
  onUpdateDate,
  onAddResult,
  onRemoveResult,
  onAddGoal,
  onRemoveGoal,
  onAddAssist,
  onRemoveAssist,
}) {
  const canEdit = isAdmin && !isViewer;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const visibleMatches = matchHistory.slice(0, visibleCount);

  const golRanking = useMemo(() => {
    const map = {};
    matchHistory.forEach((m) => {
      m.goals.forEach((g) => {
        if (g.gols > 0) map[g.nome] = (map[g.nome] || 0) + g.gols;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, gols]) => ({ label: nome, value: gols, valueLabel: `${gols} ${gols === 1 ? 'gol' : 'gols'}` }));
  }, [matchHistory]);

  const assistRanking = useMemo(() => {
    const map = {};
    matchHistory.forEach((m) => {
      m.goals.forEach((g) => {
        if (g.assistencias > 0) map[g.nome] = (map[g.nome] || 0) + g.assistencias;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, n]) => ({ label: nome, value: n, valueLabel: `${n} ${n === 1 ? 'assist.' : 'assists.'}` }));
  }, [matchHistory]);

  const winRanking = useMemo(() => {
    const map = {};
    matchHistory.forEach((m) => {
      m.teams.forEach((t) => {
        const wins = teamResultCount(m, t, 'vitorias');
        if (wins > 0) t.players.forEach((p) => { map[p.nome] = (map[p.nome] || 0) + wins; });
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([nome, n]) => ({ label: nome, value: n, valueLabel: `${n} ${n === 1 ? 'vitória' : 'vitórias'}` }));
  }, [matchHistory]);

  const pairRanking = useMemo(() => {
    const pairCounts = {};
    matchHistory.forEach((m) => {
      m.teams.forEach((t) => {
        const roster = t.players;
        for (let i = 0; i < roster.length; i++) {
          for (let j = i + 1; j < roster.length; j++) {
            const key = [roster[i].nome, roster[j].nome].sort().join(' & ');
            pairCounts[key] = (pairCounts[key] || 0) + 1;
          }
        }
      });
    });
    return Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, INSIGHT_SIZE)
      .map(([dupla, n]) => ({ label: dupla, value: n, valueLabel: `${n} ${n === 1 ? 'vez' : 'vezes'}` }));
  }, [matchHistory]);

  const attendanceRanking = useMemo(() => {
    const counts = {};
    matchHistory.forEach((m) => {
      m.teams.forEach((t) => {
        t.players.forEach((p) => {
          counts[p.nome] = (counts[p.nome] || 0) + 1;
        });
      });
    });
    const total = matchHistory.length;
    return Object.entries(counts)
      .map(([nome, count]) => ({ nome, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, INSIGHT_SIZE)
      .map((a) => ({ label: a.nome, value: a.count, valueLabel: `${a.count}/${total} (${a.pct}%)` }));
  }, [matchHistory]);

  const streakRanking = useMemo(() => {
    const sortedMatches = [...matchHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const playerNames = new Set();
    sortedMatches.forEach((m) => m.teams.forEach((t) => t.players.forEach((p) => playerNames.add(p.nome))));

    const streaks = [...playerNames].map((nome) => {
      let streak = 0;
      for (const m of sortedMatches) {
        const played = m.teams.some((t) => t.players.some((p) => p.nome === nome));
        if (played) streak++;
        else break;
      }
      return { nome, streak };
    });

    return streaks
      .filter((s) => s.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, INSIGHT_SIZE)
      .map((s) => ({ label: s.nome, value: s.streak, valueLabel: `${s.streak} ${s.streak === 1 ? 'pelada' : 'peladas'}` }));
  }, [matchHistory]);

  const monthlyPlayerStats = useMemo(() => {
    const now = new Date();
    const monthMatches = matchHistory.filter((m) => isSameMonth(m.date, now));
    const map = {};
    const ensure = (id, nome) => {
      if (!map[id]) map[id] = { id, nome, gols: 0, assistencias: 0, presencas: 0, vitorias: 0, empates: 0 };
      return map[id];
    };

    monthMatches.forEach((m) => {
      m.teams.forEach((t) => {
        const vitorias = teamResultCount(m, t, 'vitorias');
        const empates = teamResultCount(m, t, 'empates');
        t.players.forEach((p) => {
          const entry = ensure(p.id, p.nome);
          entry.presencas += 1;
          entry.vitorias += vitorias;
          entry.empates += empates;
        });
      });
      m.goals.forEach((g) => {
        const entry = ensure(g.playerId, g.nome);
        entry.gols += g.gols || 0;
        entry.assistencias += g.assistencias || 0;
      });
    });

    return Object.values(map);
  }, [matchHistory]);

  const buildMonthlyAward = (statKey) => {
    const candidates = monthlyPlayerStats.filter((s) => s[statKey] > 0);
    if (candidates.length === 0) return null;
    const stat = [...candidates].sort((a, b) => b[statKey] - a[statKey])[0];
    const playerData = players.find((p) => p.id === stat.id || p.nome === stat.nome);
    return { stat, playerData };
  };

  const buildSpotlightStats = (stat, extraLabel, extraValue) => {
    const decided = stat.vitorias + stat.empates;
    return [
      { label: 'Vitórias', value: `${stat.vitorias} (${pct(stat.vitorias, decided)}%)` },
      { label: 'Empates', value: `${stat.empates} (${pct(stat.empates, decided)}%)` },
      { label: 'Presenças', value: stat.presencas },
      { label: extraLabel, value: extraValue },
    ];
  };

  const topScorerMonth = buildMonthlyAward('gols');
  const topAssistMonth = buildMonthlyAward('assistencias');

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card">
        <h2 className="text-[15px] font-semibold text-fc-dark tracking-tight">Estatísticas</h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <PlayerSpotlightCard
          badgeIcon="ball"
          badgeLabel="Artilheiro do mês"
          tone="coral"
          emptyText="Nenhum gol esse mês ainda."
          player={topScorerMonth ? { nome: topScorerMonth.stat.nome, fotoJogo: topScorerMonth.playerData?.fotoJogo } : null}
          mainValue={topScorerMonth?.stat.gols}
          mainUnit={topScorerMonth?.stat.gols === 1 ? 'gol' : 'gols'}
          stats={topScorerMonth ? buildSpotlightStats(topScorerMonth.stat, 'Assistências', topScorerMonth.stat.assistencias) : []}
        />
        <PlayerSpotlightCard
          badgeIcon="assist"
          badgeLabel="Assistente do mês"
          tone="dark"
          emptyText="Nenhuma assistência esse mês ainda."
          player={topAssistMonth ? { nome: topAssistMonth.stat.nome, fotoJogo: topAssistMonth.playerData?.fotoJogo } : null}
          mainValue={topAssistMonth?.stat.assistencias}
          mainUnit={topAssistMonth?.stat.assistencias === 1 ? 'assist.' : 'assists.'}
          stats={topAssistMonth ? buildSpotlightStats(topAssistMonth.stat, 'Gols', topAssistMonth.stat.gols) : []}
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <LeaderTile
          icon="ball"
          label="Artilheiro"
          name={golRanking[0]?.label}
          value={golRanking[0]?.valueLabel}
          tone="bg-fc-coral/15 text-fc-coraldark"
        />
        <LeaderTile
          icon="assist"
          label="Garçom"
          name={assistRanking[0]?.label}
          value={assistRanking[0]?.valueLabel}
          tone="bg-fc-dark/10 text-fc-dark"
        />
        <LeaderTile
          icon="trophy"
          label="Mais vitórias"
          name={winRanking[0]?.label}
          value={winRanking[0]?.valueLabel}
          tone="bg-fc-limesoft text-fc-dark"
        />
        <LeaderTile
          icon="target"
          label="Sempre presente"
          name={attendanceRanking[0]?.label}
          value={attendanceRanking[0]?.valueLabel}
          tone="bg-fc-cream text-fc-dark/70"
        />
      </div>

      <RankingCard icon="ball" title="Artilheiros" tone="warm" entries={golRanking} emptyText="Nenhum gol registrado ainda." />
      <RankingCard icon="assist" title="Assistências" tone="dark" entries={assistRanking} emptyText="Nenhuma assistência registrada ainda." />
      <RankingCard icon="trophy" title="Ranking de vitórias" tone="accent" entries={winRanking} emptyText="Nenhuma vitória registrada ainda." />

      <div className="grid grid-cols-1 gap-3">
        <RankingCard icon="users" title="Dupla mais frequente" tone="neutral" entries={pairRanking} emptyText="Sem dados ainda." limit={INSIGHT_SIZE} />
        <div className="grid grid-cols-2 gap-3">
          <RankingCard icon="target" title="Sempre presente" tone="neutral" entries={attendanceRanking} emptyText="Sem dados ainda." limit={INSIGHT_SIZE} />
          <RankingCard icon="flame" title="Sequência atual" tone="warm" entries={streakRanking} emptyText="Sem dados ainda." limit={INSIGHT_SIZE} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card">
        <div className="flex items-center gap-2 mb-2.5">
          <h3 className="text-[13px] font-semibold text-fc-dark">Histórico</h3>
          <InfoTooltip text="Registro dos sorteios já feitos, com os times formados e o resultado de cada pelada." />
        </div>
        {matchHistory.length === 0 ? (
          <EmptyState>Nenhum sorteio registrado ainda.</EmptyState>
        ) : (
          <div className="space-y-2.5">
            {visibleMatches.map((m) => (
              <div key={m.id} className="border border-fc-line rounded-xl p-3">
                <div className="flex justify-between items-center mb-2.5 gap-2">
                  {canEdit ? (
                    <input
                      type="date"
                      value={toDateInputValue(m.date)}
                      onChange={(e) => onUpdateDate(m.id, e.target.value)}
                      className="text-[12px] font-medium text-fc-dark/70 bg-transparent border-none p-0 focus:outline-none"
                    />
                  ) : (
                    <span className="text-[12px] font-medium text-fc-muted">{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => onRequestDeleteMatch(m.id)}
                      className="w-6 h-6 shrink-0 rounded-lg hover:bg-orange-50 text-fc-muted hover:text-fc-coraldark flex items-center justify-center transition"
                      title="Excluir sorteio"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {m.teams.map((t) => {
                    const vitorias = teamResultCount(m, t, 'vitorias');
                    const empates = teamResultCount(m, t, 'empates');
                    return (
                      <div
                        key={t.id}
                        className={`rounded-lg p-2 border ${vitorias > 0 ? 'bg-fc-limesoft border-fc-lime/40' : 'border-fc-line'}`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
                          <span className="text-[12px] font-medium text-fc-dark">{t.name}</span>
                          <div className="flex items-center gap-1">
                            <ResultChip
                              icon="trophy"
                              label="Vitória"
                              count={vitorias}
                              tone="border-fc-lime/50 bg-white text-fc-dark"
                              canEdit={canEdit}
                              onAdd={() => onAddResult(m.id, t.id, 'vitorias')}
                              onRemove={() => onRemoveResult(m.id, t.id, 'vitorias')}
                            />
                            <ResultChip
                              icon="draw"
                              label="Empate"
                              count={empates}
                              tone="border-fc-line bg-white text-fc-dark/70"
                              canEdit={canEdit}
                              onAdd={() => onAddResult(m.id, t.id, 'empates')}
                              onRemove={() => onRemoveResult(m.id, t.id, 'empates')}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {t.players.map((p) => {
                            const goalEntry = m.goals.find((g) => g.playerId === p.id);
                            const gols = goalEntry?.gols || 0;
                            const assistencias = goalEntry?.assistencias || 0;

                            if (!canEdit) {
                              return (
                                <span
                                  key={p.id}
                                  className="text-[11px] font-medium text-fc-dark/80 bg-white border border-fc-line rounded-full pl-2 pr-1.5 py-0.5 flex items-center gap-1"
                                >
                                  {p.nome}
                                  {gols > 0 && (
                                    <span className="flex items-center gap-0.5 text-[9px] font-semibold text-white bg-fc-coral rounded-full px-1.5 py-0.5">
                                      <Icon name="ball" size={7} strokeWidth={2} /> {gols}
                                    </span>
                                  )}
                                  {assistencias > 0 && (
                                    <span className="flex items-center gap-0.5 text-[9px] font-semibold text-white bg-fc-dark/70 rounded-full px-1.5 py-0.5">
                                      <Icon name="assist" size={7} strokeWidth={2.2} /> {assistencias}
                                    </span>
                                  )}
                                </span>
                              );
                            }

                            return (
                              <span
                                key={p.id}
                                className="text-[11px] font-medium text-fc-dark/80 bg-white border border-fc-line rounded-full pl-2 pr-1 py-0.5 flex items-center gap-1"
                              >
                                <button type="button" onClick={() => onAddGoal(m.id, p.id, p.nome)} title="Marcar gol">
                                  {p.nome}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onAddAssist(m.id, p.id, p.nome)}
                                  title="Marcar assistência"
                                  className="w-4 h-4 rounded-full bg-fc-cream hover:bg-fc-line text-fc-dark/50 hover:text-fc-dark flex items-center justify-center transition shrink-0"
                                >
                                  <Icon name="assist" size={8} strokeWidth={2.2} />
                                </button>
                                {gols > 0 && (
                                  <span
                                    onClick={() => onRemoveGoal(m.id, p.id)}
                                    title="Tirar gol"
                                    className="flex items-center gap-0.5 text-[10px] font-medium text-white bg-fc-coral rounded-full px-1.5 py-0.5 shrink-0"
                                  >
                                    {gols}
                                  </span>
                                )}
                                {assistencias > 0 && (
                                  <span
                                    onClick={() => onRemoveAssist(m.id, p.id)}
                                    title="Tirar assistência"
                                    className="flex items-center gap-0.5 text-[10px] font-medium text-white bg-fc-dark/70 rounded-full px-1.5 py-0.5 shrink-0"
                                  >
                                    {assistencias}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {visibleCount < matchHistory.length && (
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="w-full text-[12px] font-medium text-fc-dark/70 bg-fc-cream hover:bg-fc-line py-2.5 rounded-xl transition"
              >
                Ver mais
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
