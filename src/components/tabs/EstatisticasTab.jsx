import { useMemo, useState } from 'react';
import Icon from '../Icon';

const PAGE_SIZE = 5;
const INSIGHT_SIZE = 3;

function toDateInputValue(isoDate) {
  return isoDate.slice(0, 10);
}

function StatCard({ icon, title, badge, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon name={icon} size={15} className="text-fc-dark/50" />
        <h3 className="text-[13px] font-semibold text-fc-dark">{title}</h3>
        {badge && <span className="text-[10px] font-medium text-fc-dark/70 bg-fc-limesoft px-2 py-0.5 rounded-full">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function RankRow({ position, label, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-fc-dark/70 bg-fc-cream',
    accent: 'text-fc-dark bg-fc-limesoft',
    warm: 'text-fc-coraldark bg-orange-50',
  };

  return (
    <div className="flex justify-between items-center text-[13px] py-1.5 gap-2">
      <span className="font-medium text-fc-dark min-w-0">
        {position != null && <span className="text-fc-muted mr-1.5">{position}º</span>}
        {label}
      </span>
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${tones[tone]}`}>{value}</span>
    </div>
  );
}

function EmptyState({ children }) {
  return <p className="text-[12px] text-fc-muted text-center py-3">{children}</p>;
}

export default function EstatisticasTab({ matchHistory, isAdmin, isViewer, onRequestDeleteMatch, onUpdateDate, onToggleWinner, onAddGoal, onRemoveGoal }) {
  const canEdit = isAdmin && !isViewer;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleMatches = matchHistory.slice(0, visibleCount);

  const golRanking = useMemo(() => {
    const map = {};
    matchHistory.forEach((m) => {
      m.goals.forEach((g) => {
        map[g.nome] = (map[g.nome] || 0) + g.gols;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [matchHistory]);

  const winRanking = useMemo(() => {
    const map = {};
    matchHistory.forEach((m) => {
      const winningPlayers = m.teams.filter((t) => m.winners.includes(t.id)).flatMap((t) => t.players);
      winningPlayers.forEach((p) => {
        map[p.nome] = (map[p.nome] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
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
      .slice(0, INSIGHT_SIZE);
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
      .slice(0, INSIGHT_SIZE);
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
      .slice(0, INSIGHT_SIZE);
  }, [matchHistory]);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card">
        <h2 className="text-[15px] font-semibold text-fc-dark tracking-tight">Estatísticas</h2>
        <p className="text-[11px] text-fc-muted mt-0.5">Histórico das peladas, artilharia e quem mais venceu.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card">
        <h3 className="text-[13px] font-semibold text-fc-dark mb-2.5">Histórico</h3>
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
                    const isWinner = m.winners.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`rounded-lg p-2 border ${isAdmin && isWinner ? 'bg-fc-limesoft border-fc-lime/40' : 'border-fc-line'}`}
                      >
                        {isAdmin ? (
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() => onToggleWinner(m.id, t.id)}
                            className={`text-[12px] font-medium mb-1.5 flex items-center gap-1.5 ${isWinner ? 'text-fc-dark' : 'text-fc-muted'}`}
                            title="Marcar/desmarcar como vencedor"
                          >
                            {t.name}
                            {isWinner && <Icon name="trophy" size={12} />}
                          </button>
                        ) : (
                          <span className="text-[12px] font-medium text-fc-dark mb-1.5 block">{t.name}</span>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {t.players.map((p) => {
                            if (!isAdmin) {
                              return (
                                <span
                                  key={p.id}
                                  className="text-[11px] font-medium text-fc-dark/80 bg-fc-cream rounded-full px-2 py-0.5"
                                >
                                  {p.nome}
                                </span>
                              );
                            }
                            const goalEntry = m.goals.find((g) => g.playerId === p.id);
                            const gols = goalEntry?.gols || 0;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                disabled={!canEdit}
                                onClick={() => onAddGoal(m.id, p.id, p.nome)}
                                title="Clique pra marcar um gol"
                                className="text-[11px] font-medium text-fc-dark/80 bg-white border border-fc-line rounded-full pl-2 pr-1 py-0.5 flex items-center gap-1"
                              >
                                {p.nome}
                                {gols > 0 && (
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (canEdit) onRemoveGoal(m.id, p.id);
                                    }}
                                    title="Clique pra remover um gol"
                                    className="bg-fc-coral text-white rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                  >
                                    {gols}
                                  </span>
                                )}
                              </button>
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

      <StatCard icon="users" title="Dupla mais frequente">
        {pairRanking.length === 0 ? (
          <EmptyState>Sem dados ainda.</EmptyState>
        ) : (
          pairRanking.map(([dupla, count]) => (
            <RankRow key={dupla} label={dupla} value={`${count} ${count === 1 ? 'vez' : 'vezes'}`} tone="accent" />
          ))
        )}
      </StatCard>

      <StatCard icon="target" title="Sempre presente">
        {attendanceRanking.length === 0 ? (
          <EmptyState>Sem dados ainda.</EmptyState>
        ) : (
          attendanceRanking.map((a) => (
            <RankRow key={a.nome} label={a.nome} value={`${a.count} de ${matchHistory.length} (${a.pct}%)`} tone="accent" />
          ))
        )}
      </StatCard>

      <StatCard icon="flame" title="Sequência atual">
        {streakRanking.length === 0 ? (
          <EmptyState>Sem dados ainda.</EmptyState>
        ) : (
          streakRanking.map((s) => (
            <RankRow key={s.nome} label={s.nome} value={`${s.streak} ${s.streak === 1 ? 'pelada' : 'peladas'}`} tone="warm" />
          ))
        )}
      </StatCard>

      {isAdmin && (
        <>
          <StatCard icon="trophy" title="Ranking de vitórias" badge="Beta">
            {winRanking.length === 0 ? (
              <EmptyState>Sem dados ainda.</EmptyState>
            ) : (
              winRanking.map(([nome, count], i) => <RankRow key={nome} position={i + 1} label={nome} value={count} tone="accent" />)
            )}
          </StatCard>

          <StatCard icon="ball" title="Ranking de gols" badge="Beta">
            {golRanking.length === 0 ? (
              <EmptyState>Sem dados ainda.</EmptyState>
            ) : (
              golRanking.map(([nome, gols], i) => <RankRow key={nome} position={i + 1} label={nome} value={gols} tone="warm" />)
            )}
          </StatCard>
        </>
      )}
    </div>
  );
}
