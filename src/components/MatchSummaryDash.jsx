import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import Avatar from './Avatar';
import ResultChip from './ResultChip';
import PlayerStatTrigger from './PlayerStatTrigger';

function useMatchCountdown(match) {
  const [timeLeftMs, setTimeLeftMs] = useState(0);

  useEffect(() => {
    if (!match) {
      setTimeLeftMs(0);
      return;
    }
    const calcTime = () => {
      const refDateStr = match.finalizadoEm || match.date;
      if (!refDateStr) return 0;
      const refTime = new Date(refDateStr).getTime();
      if (isNaN(refTime)) return 0;
      const deadline = refTime + 24 * 60 * 60 * 1000;
      return Math.max(0, deadline - Date.now());
    };

    setTimeLeftMs(calcTime());
    const interval = setInterval(() => {
      const ms = calcTime();
      setTimeLeftMs(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [match]);

  return timeLeftMs;
}

function formatCountdown(ms) {
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

export default function MatchSummaryDash({
  match,
  players = [],
  isAdmin = false,
  isViewer = false,
  canEditStats = false,
  onStartNextFut,
  onClose,
  isModal = false,
  onAddResult,
  onRemoveResult,
  onAddGoal,
  onRemoveGoal,
  onAddAssist,
  onRemoveAssist,
}) {
  const timeLeftMs = useMatchCountdown(match);
  const formattedCountdown = formatCountdown(timeLeftMs);
  const isMatchFinalized = match?.finalizado === true;

  const stats = useMemo(() => {
    if (!match) return null;

    const teams = Array.isArray(match.teams) ? match.teams : [];
    const goals = Array.isArray(match.goals) ? match.goals : [];
    const safePlayers = Array.isArray(players) ? players : [];

    // 1. Campeão do Dia (Time com mais vitórias)
    const maxVitorias = teams.length > 0 ? Math.max(...teams.map((t) => (t && typeof t.vitorias === 'number' ? t.vitorias : 0)), 0) : 0;
    const winningTeams = teams.filter((t) => t && (t.vitorias || 0) === maxVitorias && maxVitorias > 0);
    const winningTeamIds = new Set(winningTeams.map((t) => t.id).filter(Boolean));

    // Mapear jogadores aos times pra saber quem ganhou
    const teamPlayerMap = new Map();
    teams.forEach((t) => {
      if (t && Array.isArray(t.players)) {
        t.players.forEach((p) => {
          // p can be an object {id, nome} OR a plain string (player ID)
          const id = typeof p === 'string' ? p : p?.id;
          if (id) teamPlayerMap.set(id, t.id);
        });
      }
    });

    // 2. Artilheiro do Dia
    let topScorers = [];
    let maxGols = 0;
    goals.forEach((g) => {
      if (g && (g.gols || 0) > maxGols) {
        maxGols = g.gols;
        topScorers = [g];
      } else if (g && (g.gols || 0) === maxGols && maxGols > 0) {
        topScorers.push(g);
      }
    });

    // 3. Garçom do Dia
    let topAssisters = [];
    let maxAssists = 0;
    goals.forEach((g) => {
      if (g && (g.assistencias || 0) > maxAssists) {
        maxAssists = g.assistencias;
        topAssisters = [g];
      } else if (g && (g.assistencias || 0) === maxAssists && maxAssists > 0) {
        topAssisters.push(g);
      }
    });

    // 4. MVP / Cara da Rodada
    let topMvpScore = -1;
    let mvpPlayers = [];

    const rawPlayerIds = [
      ...goals.map((g) => g?.playerId),
      ...teams.flatMap((t) => (Array.isArray(t?.players) ? t.players.map((p) => (p && typeof p === 'object' ? p.id : p)) : [])),
    ];
    const allPlayerIds = new Set(rawPlayerIds.filter(Boolean));

    allPlayerIds.forEach((playerId) => {
      const gEntry = goals.find((g) => g && g.playerId === playerId);
      const gols = gEntry?.gols || 0;
      const assistencias = gEntry?.assistencias || 0;
      const teamId = teamPlayerMap.get(playerId);
      const isWinner = teamId ? winningTeamIds.has(teamId) : false;

      const score = gols * 3 + assistencias * 2 + (isWinner ? 2 : 0);
      if (score > topMvpScore && score > 0) {
        topMvpScore = score;
        const pObj = safePlayers.find((p) => p && p.id === playerId) || { id: playerId, nome: gEntry?.nome || gEntry?.playerName || 'Jogador' };
        mvpPlayers = [{ player: pObj, gols, assistencias, score, isWinner }];
      } else if (score === topMvpScore && score > 0) {
        const pObj = safePlayers.find((p) => p && p.id === playerId) || { id: playerId, nome: gEntry?.nome || gEntry?.playerName || 'Jogador' };
        mvpPlayers.push({ player: pObj, gols, assistencias, score, isWinner });
      }
    });

    const totalGols = goals.reduce((sum, g) => sum + (g?.gols || 0), 0);
    const totalAssistencias = goals.reduce((sum, g) => sum + (g?.assistencias || 0), 0);

    return {
      teams,
      goals,
      winningTeams,
      maxVitorias,
      topScorers,
      maxGols,
      topAssisters,
      maxAssists,
      mvpPlayers,
      topMvpScore,
      totalGols,
      totalAssistencias,
    };
  }, [match, players]);

  if (!stats) return null;

  const formattedDate = match?.date
    ? new Date(match.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    : 'Partida Finalizada';

  const getPlayerData = (playerId, fallbackName) => {
    const safePlayers = Array.isArray(players) ? players : [];
    const p = safePlayers.find((pl) => pl && pl.id === playerId);
    return {
      nome: p?.nome || fallbackName || 'Jogador',
      foto: p?.foto || null,
    };
  };

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Header do Resumo */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[23px] md:text-[27px] font-extrabold text-fc-ink tracking-tight leading-tight truncate">Resumo Geral do Fut</h2>
          <p className="text-[12.5px] text-fc-muted font-medium capitalize truncate mt-0.5">{formattedDate}</p>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-fc-cream hover:bg-fc-line text-fc-ink/60 flex items-center justify-center transition shrink-0"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>

      {/* Botão ADM para iniciar o próximo Fut */}
      {isAdmin && !isViewer && onStartNextFut && !isModal && (
        <div className="bg-fc-dark rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-[12px] text-fc-lime font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-fc-lime animate-ping" />
            Pronto para a próxima pelada?
          </p>
          <button
            onClick={onStartNextFut}
            className="w-full sm:w-auto bg-fc-lime hover:bg-fc-lime/90 text-fc-dark font-bold text-[12.5px] px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Icon name="plus" size={15} /> Abrir Nova Chamada
          </button>
        </div>
      )}

      {/* Banner do Relógio de Edição (24h) */}
      {isMatchFinalized && (
        <div
          className={`rounded-2xl p-3 border flex items-center gap-2.5 shadow-xs transition ${
            timeLeftMs > 0 ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-fc-cream border-fc-line text-fc-muted'
          }`}
        >
          <span
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              timeLeftMs > 0 ? 'bg-amber-200 text-amber-700' : 'bg-fc-surface text-fc-muted'
            }`}
          >
            <Icon name={timeLeftMs > 0 ? 'clock' : 'lock'} size={15} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[12.5px] font-bold tracking-tight">
                {timeLeftMs > 0 ? 'Edição pós-jogo liberada' : 'Edição encerrada (24h ultrapassadas)'}
              </span>
              {timeLeftMs > 0 && formattedCountdown && (
                <span className="text-[9.5px] font-extrabold bg-amber-300/70 text-amber-900 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {formattedCountdown} restantes
                </span>
              )}
            </div>
            <p className="text-[11.5px] opacity-80 mt-0.5">
              {timeLeftMs > 0
                ? 'Edite vitórias, gols e assistências na classificação abaixo.'
                : 'Prazo encerrado. Apenas ADMs podem alterar os dados.'}
            </p>
          </div>
        </div>
      )}

      {/* HERO SPOTLIGHTS (Campeão e MVP) */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 items-stretch">
        {/* CAMPEÃO DO DIA */}
        <div className="bg-gradient-to-br from-amber-500/10 via-fc-surface to-fc-surface rounded-2xl p-3.5 md:p-4 border border-amber-500/30 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <span className="text-[10.5px] font-bold tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 border border-amber-300/50 whitespace-nowrap">
                <Icon name="trophy" size={11} /> Campeão do Dia
              </span>
              <span className="text-[11px] font-extrabold text-amber-900 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                {stats.maxVitorias} {stats.maxVitorias === 1 ? 'Vitória' : 'Vitórias'}
              </span>
            </div>

            {stats.winningTeams.length > 0 ? (
              <div className="space-y-2.5">
                {stats.winningTeams.map((team) => (
                  <div key={team.id} className="bg-fc-cream/90 rounded-xl p-3 border border-amber-200/80 shadow-xs">
                    <h3 className="font-bold text-[15px] text-fc-ink mb-2.5 flex items-center justify-between gap-2">
                      <span className="truncate">{team.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-md">
                        1º Lugar
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(team.players || []).map((tp) => {
                        const pData = getPlayerData(tp.id, tp.nome);
                        return (
                          <div
                            key={tp.id}
                            className="flex items-center gap-1.5 bg-fc-surface px-2.5 py-1 rounded-lg border border-fc-line text-[11.5px] font-semibold text-fc-ink shadow-2xs"
                          >
                            <Avatar nome={pData.nome} foto={pData.foto} size="w-5 h-5" textSize="text-[9px]" />
                            <span>{pData.nome}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-fc-muted py-3 text-center font-medium">Nenhum time venceu nesta rodada.</p>
            )}
          </div>
        </div>

        {/* MVP / CARA DA RODADA */}
        <div className="bg-gradient-to-br from-fc-lime/20 via-fc-surface to-fc-surface rounded-2xl p-3.5 md:p-4 border border-fc-lime/40 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <span className="text-[10.5px] font-bold tracking-wider text-fc-dark bg-fc-lime px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 whitespace-nowrap">
                <Icon name="star" size={11} /> Cara da Rodada (MVP)
              </span>
              <span className="text-[11px] font-semibold text-fc-ink/60">Destaque Geral</span>
            </div>

            {stats.mvpPlayers.length > 0 ? (
              <div className="space-y-2">
                {stats.mvpPlayers.map(({ player, gols, assistencias, isWinner }) => (
                  <div key={player.id} className="flex items-center gap-3 bg-fc-cream/90 p-3 rounded-xl border border-fc-lime/30 shadow-xs">
                    <Avatar nome={player.nome} foto={player.foto} size="w-12 h-12 md:w-14 md:h-14" textSize="text-[12px]" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[15px] md:text-[16px] text-fc-ink truncate">{player.nome}</h3>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {gols > 0 && (
                          <span className="text-[10px] font-bold text-white bg-fc-coral px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                            <Icon name="ball" size={9} /> {gols} {gols === 1 ? 'gol' : 'gols'}
                          </span>
                        )}
                        {assistencias > 0 && (
                          <span className="text-[10px] font-bold text-white bg-fc-dark/80 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                            <Icon name="assist" size={9} /> {assistencias} {assistencias === 1 ? 'assist' : 'assists'}
                          </span>
                        )}
                        {isWinner && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full shrink-0 border border-amber-300/50 flex items-center gap-0.5">
                            <Icon name="trophy" size={9} /> Campeão
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-fc-muted py-3 text-center font-medium">Nenhum jogador pontuou nesta rodada.</p>
            )}
          </div>
        </div>
      </div>

      {/* ARTILHEIRO E GARÇOM DO DIA */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 items-stretch">
        {/* ARTILHEIRO DO DIA */}
        <div className="bg-fc-surface rounded-2xl p-3.5 border border-fc-line shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
              <span className="text-[12px] font-bold text-fc-ink flex items-center gap-1.5">
                <Icon name="ball" size={14} className="text-fc-coral" /> Artilheiro do Dia
              </span>
              <span className="text-[11px] font-extrabold text-white bg-fc-coral px-2.5 py-0.5 rounded-full shadow-2xs">
                {stats.maxGols} {stats.maxGols === 1 ? 'Gol' : 'Gols'}
              </span>
            </div>

            {stats.topScorers.length > 0 ? (
              <div className="space-y-2">
                {stats.topScorers.map((g) => {
                  const pData = getPlayerData(g.playerId, g.nome);
                  return (
                    <div key={g.playerId} className="flex items-center gap-2.5 bg-fc-cream/60 p-2.5 rounded-xl border border-fc-line/60">
                      <Avatar nome={pData.nome} foto={pData.foto} size="w-9 h-9" textSize="text-[10px]" />
                      <span className="font-semibold text-[13px] text-fc-ink flex-1 truncate">{pData.nome}</span>
                      <span className="text-[11px] font-bold text-white bg-fc-coral px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                        <Icon name="ball" size={10} /> {g.gols}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12px] text-fc-muted text-center py-2">Nenhum gol marcado.</p>
            )}
          </div>
        </div>

        {/* GARÇOM DO DIA */}
        <div className="bg-fc-surface rounded-2xl p-3.5 border border-fc-line shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
              <span className="text-[12px] font-bold text-fc-ink flex items-center gap-1.5">
                <Icon name="assist" size={14} className="text-fc-dark" /> Garçom do Dia
              </span>
              <span className="text-[11px] font-extrabold text-white bg-fc-dark/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                {stats.maxAssists} {stats.maxAssists === 1 ? 'Assistência' : 'Assistências'}
              </span>
            </div>

            {stats.topAssisters.length > 0 ? (
              <div className="space-y-2">
                {stats.topAssisters.map((g) => {
                  const pData = getPlayerData(g.playerId, g.nome);
                  return (
                    <div key={g.playerId} className="flex items-center gap-2.5 bg-fc-cream/60 p-2.5 rounded-xl border border-fc-line/60">
                      <Avatar nome={pData.nome} foto={pData.foto} size="w-9 h-9" textSize="text-[10px]" />
                      <span className="font-semibold text-[13px] text-fc-ink flex-1 truncate">{pData.nome}</span>
                      <span className="text-[11px] font-bold text-white bg-fc-dark/80 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                        <Icon name="assist" size={10} /> {g.assistencias}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12px] text-fc-muted text-center py-2">Nenhuma assistência marcada.</p>
            )}
          </div>
        </div>
      </div>

      {/* TABELA DE RESULTADOS DOS TIMES */}
      <div className="bg-fc-surface rounded-2xl p-3.5 md:p-4 border border-fc-line shadow-card space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-[13px] font-bold text-fc-ink flex items-center gap-1.5">
            <Icon name="shield" size={15} className="text-fc-ink/60" /> Classificação Final da Partida
          </h3>
          {canEditStats && (
            <span className="text-[10px] font-semibold text-fc-muted bg-fc-cream px-2 py-0.5 rounded-md border border-fc-line/50">
              Toque no jogador p/ editar
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {stats.teams.map((team, idx) => {
            const vitorias = typeof team.vitorias === 'number' ? team.vitorias : match?.winners?.includes(team.id) ? 1 : 0;
            const teamPlayers = Array.isArray(team.players) ? team.players : [];

            return (
              <div
                key={team.id}
                className={`rounded-xl p-3 border transition ${
                  vitorias > 0 ? 'bg-fc-limesoft/60 border-fc-lime/40' : 'bg-fc-cream/40 border-fc-line/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-fc-dark/10 text-fc-ink font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-[13.5px] text-fc-ink truncate">{team.name}</span>
                  </div>

                  <ResultChip
                    icon="trophy"
                    label="Vitória"
                    shortLabel="Vitória"
                    count={vitorias}
                    tone="border-fc-lime/50 bg-fc-surface text-fc-ink"
                    canEdit={canEditStats}
                    confirmAdd
                    onAdd={() => onAddResult?.(match.id, team.id, 'vitorias')}
                    onRemove={() => onRemoveResult?.(match.id, team.id, 'vitorias')}
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-fc-line/30">
                  {teamPlayers.map((tp) => {
                    const pData = getPlayerData(tp.id, tp.nome);
                    const goalEntry = (match.goals || []).find((g) => g && g.playerId === tp.id);
                    const gols = goalEntry?.gols || 0;
                    const assistencias = goalEntry?.assistencias || 0;

                    return (
                      <PlayerStatTrigger
                        key={tp.id}
                        canEdit={canEditStats}
                        gols={gols}
                        assistencias={assistencias}
                        onAddGoal={() => onAddGoal?.(match.id, tp.id, pData.nome)}
                        onAddAssist={() => onAddAssist?.(match.id, tp.id, pData.nome)}
                        onRemoveGoal={() => onRemoveGoal?.(match.id, tp.id, pData.nome)}
                        onRemoveAssist={() => onRemoveAssist?.(match.id, tp.id, pData.nome)}
                      >
                        <div
                          className={`flex items-center gap-1.5 bg-fc-surface px-2.5 py-1 rounded-lg border border-fc-line text-[11.5px] font-semibold text-fc-ink transition ${
                            canEditStats ? 'active:scale-95 cursor-pointer' : ''
                          }`}
                        >
                          <Avatar nome={pData.nome} foto={pData.foto} size="w-5 h-5" textSize="text-[9px]" />
                          <span>{pData.nome}</span>
                          {gols > 0 && (
                            <span className="flex items-center gap-0.5 text-[9.5px] font-bold text-white bg-fc-coral rounded-full px-1.5 py-0.5">
                              <Icon name="ball" size={8} strokeWidth={2} /> {gols}
                            </span>
                          )}
                          {assistencias > 0 && (
                            <span className="flex items-center gap-0.5 text-[9.5px] font-bold text-white bg-fc-dark/80 rounded-full px-1.5 py-0.5">
                              <Icon name="assist" size={8} strokeWidth={2.2} /> {assistencias}
                            </span>
                          )}
                        </div>
                      </PlayerStatTrigger>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
