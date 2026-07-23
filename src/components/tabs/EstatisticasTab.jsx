import { useMemo } from 'react';

function winningTeamNames(match) {
  if (match.winners === 'all') return 'Empate geral';
  const names = match.teams.filter((t) => match.winners.includes(t.id)).map((t) => t.name);
  return names.length > 0 ? names.join(' e ') : '—';
}

function isWinningTeam(match, teamId) {
  return match.winners === 'all' || match.winners.includes(teamId);
}

export default function EstatisticasTab({ matchHistory }) {
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
      const winningPlayers =
        m.winners === 'all' ? m.teams.flatMap((t) => t.players) : m.teams.filter((t) => m.winners.includes(t.id)).flatMap((t) => t.players);
      winningPlayers.forEach((p) => {
        map[p.nome] = (map[p.nome] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [matchHistory]);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <h2 className="text-base font-black text-fc-dark tracking-tight">📊 Estatísticas</h2>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Histórico das peladas, artilharia e quem mais venceu.</p>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <h3 className="text-xs font-black text-fc-dark uppercase tracking-wider mb-2">Histórico</h3>
        {matchHistory.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Nenhum resultado registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {matchHistory.map((m) => (
              <div key={m.id} className="border border-slate-100 rounded-2xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400">
                    {new Date(m.date).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-[10px] font-black text-fc-dark bg-fc-limesoft px-2 py-0.5 rounded-full">
                    🏆 {winningTeamNames(m)}
                  </span>
                </div>
                <div className="space-y-1">
                  {m.teams.map((t) => (
                    <div key={t.id} className="text-[11px]">
                      <span className={`font-black ${isWinningTeam(m, t.id) ? 'text-fc-dark' : 'text-slate-400'}`}>
                        {t.name}
                        {isWinningTeam(m, t.id) ? ' 🏆' : ''}:
                      </span>{' '}
                      <span className="text-slate-500 font-bold">{t.players.map((p) => p.nome).join(', ')}</span>
                    </div>
                  ))}
                </div>
                {m.goals.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-fc-coraldark">
                    ⚽ {m.goals.map((g) => `${g.nome} (${g.gols})`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <h3 className="text-xs font-black text-fc-dark uppercase tracking-wider mb-2">🥇 Ranking de Vitórias</h3>
        {winRanking.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-2">Sem dados ainda.</p>
        ) : (
          <div className="space-y-1">
            {winRanking.map(([nome, count], i) => (
              <div key={nome} className="flex justify-between items-center text-xs py-1">
                <span className="font-bold text-fc-dark">
                  {i + 1}º {nome}
                </span>
                <span className="font-black text-fc-dark bg-fc-limesoft px-2 py-0.5 rounded-full text-[10px]">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <h3 className="text-xs font-black text-fc-dark uppercase tracking-wider mb-2">⚽ Ranking de Gols</h3>
        {golRanking.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-2">Sem dados ainda.</p>
        ) : (
          <div className="space-y-1">
            {golRanking.map(([nome, gols], i) => (
              <div key={nome} className="flex justify-between items-center text-xs py-1">
                <span className="font-bold text-fc-dark">
                  {i + 1}º {nome}
                </span>
                <span className="font-black text-fc-coraldark bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full text-[10px]">
                  {gols}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
