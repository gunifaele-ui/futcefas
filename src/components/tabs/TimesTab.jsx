import { useState } from 'react';
import Avatar from '../Avatar';
import Icon from '../Icon';
import ResultChip from '../ResultChip';
import PlayerStatTrigger from '../PlayerStatTrigger';

const PIX_KEY = '+5515997228483';
const PIX_KEY_LABEL = '(15) 99722-8483';

function PixCard() {
  const [copied, setCopied] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopyPix}
      className="w-full bg-white rounded-2xl p-3.5 border border-fc-line shadow-card flex items-center gap-3 active:scale-[0.99] transition text-left"
    >
      <span className="w-9 h-9 rounded-full bg-fc-limesoft flex items-center justify-center text-fc-dark shrink-0">
        <Icon name="copy" size={16} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-fc-dark">Pagar mensal ou avulso (PIX)</p>
        <p className="text-[11px] text-fc-muted font-normal truncate">
          {copied ? 'Chave copiada!' : `Toque para copiar: ${PIX_KEY_LABEL}`}
        </p>
      </div>
      {copied && <Icon name="check" size={16} className="text-fc-dark" />}
    </button>
  );
}

function PlayerCell({ player: p, canEdit, matchId, statEntry, onAddGoal, onRemoveGoal, onAddAssist, onRemoveAssist }) {
  const gols = statEntry?.gols || 0;
  const assistencias = statEntry?.assistencias || 0;
  const hasStat = gols > 0 || assistencias > 0;
  const canInteract = canEdit && !!matchId;

  return (
    <PlayerStatTrigger
      canEdit={canInteract}
      gols={gols}
      assistencias={assistencias}
      onAddGoal={() => onAddGoal(matchId, p.id, p.nome)}
      onAddAssist={() => onAddAssist(matchId, p.id, p.nome)}
      onRemoveGoal={() => onRemoveGoal(matchId, p.id)}
      onRemoveAssist={() => onRemoveAssist(matchId, p.id)}
      className="w-full flex flex-col items-center"
    >
      <div
        className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-1 -m-1 transition ${
          canInteract ? 'active:scale-95 active:bg-fc-cream' : ''
        }`}
      >
        <Avatar nome={p.nome} foto={p.foto} size="w-10 h-10" textSize="text-[10px]" />
        <span className="text-[10px] font-medium text-fc-dark/80 text-center leading-tight break-words w-full px-0.5">{p.nome}</span>
        {hasStat && (
          <span className="flex items-center gap-1 flex-wrap justify-center">
            {gols > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-white bg-fc-coral rounded-full px-1.5 py-0.5">
                <Icon name="ball" size={8} strokeWidth={2} /> {gols}
              </span>
            )}
            {assistencias > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-white bg-fc-dark/70 rounded-full px-1.5 py-0.5">
                <Icon name="assist" size={8} strokeWidth={2.2} /> {assistencias}
              </span>
            )}
          </span>
        )}
      </div>
    </PlayerStatTrigger>
  );
}

function TeamCard({ team, matchId, matchTeam, matchGoals, canEdit, onAddGoal, onRemoveGoal, onAddAssist, onRemoveAssist, onAddResult, onRemoveResult }) {
  const forca = team.players.length > 0 ? (team.ratingSum / team.players.length).toFixed(2) : '0.00';
  const vitorias = matchTeam?.vitorias || 0;

  return (
    <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card">
      <div className="flex items-center justify-between mb-3.5 gap-1.5 flex-wrap">
        <span className="font-semibold text-[14px] text-fc-dark shrink-0">{team.name}</span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {matchId && (
            <ResultChip
              icon="trophy"
              label="Vitória"
              shortLabel="Vitória"
              count={vitorias}
              tone="border-fc-lime/50 bg-fc-limesoft text-fc-dark"
              canEdit={canEdit}
              onAdd={() => onAddResult(matchId, team.id, 'vitorias')}
              onRemove={() => onRemoveResult(matchId, team.id, 'vitorias')}
            />
          )}
          <span className="text-[11px] font-medium text-fc-dark/60 bg-fc-cream px-2.5 py-1 rounded-full shrink-0">Força {forca}</span>
        </div>
      </div>
      <div
        className="grid gap-y-3"
        style={{ gridTemplateColumns: `repeat(${team.players.length}, minmax(0, 1fr))` }}
      >
        {team.players.map((p) => (
          <PlayerCell
            key={p.id}
            player={p}
            canEdit={canEdit}
            matchId={matchId}
            statEntry={matchGoals?.find((g) => g.playerId === p.id)}
            onAddGoal={onAddGoal}
            onRemoveGoal={onRemoveGoal}
            onAddAssist={onAddAssist}
            onRemoveAssist={onRemoveAssist}
          />
        ))}
      </div>
    </div>
  );
}

export default function TimesTab({
  players,
  generatedTeams,
  teamsDrafted,
  currentMatch,
  isAdmin,
  isViewer,
  copied,
  onCopyTeams,
  onResetTeams,
  onGoToHistory,
  onAddGoal,
  onRemoveGoal,
  onAddAssist,
  onRemoveAssist,
  onAddResult,
  onRemoveResult,
}) {
  const canEdit = isAdmin && !isViewer;
  const goleirosPresentes = players.filter((p) => p.statusPresenca && p.posicaoFixa === 'Goleiro');
  const showPixCard = !isAdmin || isViewer;
  const [showSorteioInfo, setShowSorteioInfo] = useState(false);
  const totalLinePlayers = generatedTeams.reduce((sum, t) => sum + t.players.length, 0);

  return (
    <div className="space-y-3">
      {showPixCard && <PixCard />}

      <div className="bg-white rounded-2xl p-3.5 border border-fc-line shadow-card relative flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[14px] font-semibold text-fc-dark tracking-tight">
            {teamsDrafted ? 'Times escalados' : 'Time vai ser tirado jajá'}
          </h2>
          {teamsDrafted && (
            <p className="text-[11px] text-fc-muted mt-0.5">
              {generatedTeams.length} times, {totalLinePlayers} jogadores + {goleirosPresentes.length} goleiros
            </p>
          )}
        </div>

        {teamsDrafted && (
          <button
            onClick={onCopyTeams}
            title={copied ? 'Copiado!' : 'Copiar os times'}
            className={`absolute top-3.5 left-3.5 w-9 h-9 rounded-full flex items-center justify-center transition ${
              copied ? 'bg-fc-lime text-fc-dark' : 'bg-fc-limesoft text-fc-dark'
            }`}
          >
            <Icon name={copied ? 'check' : 'copy'} size={16} />
          </button>
        )}
      </div>

      <div className="bg-fc-limesoft/50 rounded-2xl px-3.5 py-2.5">
        <button
          type="button"
          onClick={() => setShowSorteioInfo((v) => !v)}
          className="w-full flex items-center gap-2.5 text-left"
        >
          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-fc-dark shrink-0">
            <Icon name="target" size={12} />
          </span>
          <span className="flex-1 text-[11px] text-fc-dark/80 font-medium">Como funciona o sorteio?</span>
          <Icon name="chevronDown" size={14} className={`text-fc-dark/50 shrink-0 transition-transform ${showSorteioInfo ? 'rotate-180' : ''}`} />
        </button>
        {showSorteioInfo && (
          <p className="text-[11px] text-fc-dark/80 font-medium leading-snug mt-2 pl-8">
            Cada jogador tem uma nota média, formada pela nota dada por 3 avaliadores — é essa média que vira o nível do jogador. Os times saem balanceados por nível e evitam repetir as mesmas duplas dos últimos jogos, pra ninguém cair sempre no time fraco (ou sempre no forte). Como o Time 1 e o Time 2 sempre começam jogando, eles ficam com os times de menor força — os mais fortes (3 e/ou 4) começam esperando a vez. Cada partida dura até 7 min (ou 2 gols), num rodízio de 1 hora de jogo.
          </p>
        )}
      </div>

      {canEdit && teamsDrafted && (
        <div className="bg-white rounded-2xl px-3.5 py-2.5 border border-fc-line shadow-card flex items-start gap-2.5">
          <span className="w-6 h-6 rounded-full bg-fc-cream flex items-center justify-center text-fc-dark/60 shrink-0 mt-0.5">
            <Icon name="info" size={12} />
          </span>
          <p className="text-[11px] text-fc-dark/70 leading-snug">
            Toque no nome de quem fez gol ou deu assistência. Já marcou? Dois toques rápidos no nome tiram a marcação. O botão de vitória fica no topo de cada time.
          </p>
        </div>
      )}

      {teamsDrafted && generatedTeams.length > 0 ? (
        <div className="space-y-3">
          {generatedTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              matchId={currentMatch?.id}
              matchTeam={currentMatch?.teams.find((t) => t.id === team.id)}
              matchGoals={currentMatch?.goals}
              canEdit={canEdit}
              onAddGoal={onAddGoal}
              onRemoveGoal={onRemoveGoal}
              onAddAssist={onAddAssist}
              onRemoveAssist={onRemoveAssist}
              onAddResult={onAddResult}
              onRemoveResult={onRemoveResult}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-fc-line shadow-card flex flex-col items-center gap-2.5 text-center">
          <Icon name="shield" size={26} className="text-fc-muted" strokeWidth={1.4} />
          <p className="text-[12px] text-fc-muted">Os times aparecem aqui, lado a lado, assim que forem sorteados.</p>
        </div>
      )}

      {teamsDrafted && (
        <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card">
          <span className="text-[11px] font-medium text-fc-muted flex items-center gap-1.5">
            <Icon name="gloves" size={14} /> Goleiros
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {goleirosPresentes.length === 0 ? (
              <span className="text-[11px] text-fc-muted">Nenhum goleiro confirmado.</span>
            ) : (
              goleirosPresentes.map((g) => (
                <span
                  key={g.id}
                  className="bg-fc-cream text-fc-dark/80 text-[11px] font-medium pl-1 pr-2.5 py-1 rounded-full flex items-center gap-1.5"
                >
                  <Avatar nome={g.nome} foto={g.foto} size="w-5 h-5" textSize="text-[7px]" />
                  {g.nome}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {isAdmin && !isViewer && teamsDrafted && (
        <div className="pt-1 space-y-2">
          <button
            onClick={onGoToHistory}
            className="w-full bg-fc-dark hover:bg-fc-dark2 text-white font-medium py-3 rounded-xl text-[13px] transition flex items-center justify-center gap-2"
          >
            <Icon name="chart" size={15} /> Ver / editar no histórico
          </button>
          <button
            onClick={onResetTeams}
            className="w-full bg-white hover:bg-fc-cream border border-fc-line text-fc-coraldark font-medium py-3 rounded-xl text-[13px] transition flex items-center justify-center gap-2"
          >
            <Icon name="refresh" size={15} /> Nova chamada (resetar times)
          </button>
        </div>
      )}
    </div>
  );
}
