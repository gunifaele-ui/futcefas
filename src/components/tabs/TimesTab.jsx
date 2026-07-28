import { useState } from 'react';
import Avatar from '../Avatar';
import Icon from '../Icon';
import ResultChip from '../ResultChip';
import PlayerStatTrigger from '../PlayerStatTrigger';
import PresencaTab from './PresencaTab';
import MatchSummaryDash from '../MatchSummaryDash';

const PIX_KEY = '+5515997228483';
const PIX_KEY_LABEL = '(15) 99722-8483';

function PixLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M112.57 391.26a66.57 66.57 0 0 0 47.14 19.53h.03c17.8 0 34.54-6.93 47.14-19.53l88.08-88.08c5.4-5.4 14.85-5.4 20.25 0l88.4 88.4a66.57 66.57 0 0 0 47.14 19.53h12.63l-111.57-111.57a66.67 66.67 0 0 0-94.28 0l-88.07 88.07A22.37 22.37 0 0 1 153.6 393zm286.25-270.52a66.57 66.57 0 0 0-47.14-19.53h-12.63l111.56 111.56a66.67 66.67 0 0 0 0 94.28L450.6 193.06l-2.44-2.44a66.57 66.57 0 0 0-49.34-70.18zM153.6 119a22.37 22.37 0 0 1 15.84 6.56l88.07 88.08a66.67 66.67 0 0 0 94.28 0l88.08-88.08A66.57 66.57 0 0 0 392.73 106h-.03c-17.8 0-34.54 6.93-47.14 19.53l-88.4 88.4c-5.4 5.4-14.85 5.4-20.25 0l-88.08-88.08A22.37 22.37 0 0 1 153.6 119zM61.4 306.94l111.56-111.56a66.67 66.67 0 0 0 0-94.28L61.4 306.94zm0 0" fill="currentColor"/>
      <path d="M112.57 120.74a66.57 66.57 0 0 1 47.14-19.53h.03c17.8 0 34.54 6.93 47.14 19.53l88.08 88.08c5.4 5.4 14.85 5.4 20.25 0l88.4-88.4A66.57 66.57 0 0 1 450.6 101.4l-111.57 111.57a66.67 66.67 0 0 1-94.28 0l-88.07-88.07A22.37 22.37 0 0 0 153.6 119zm0 270.52a66.57 66.57 0 0 0 47.14 19.53h.03c17.8 0 34.54-6.93 47.14-19.53l88.08-88.08c5.4-5.4 14.85-5.4 20.25 0l88.4 88.4A66.57 66.57 0 0 0 450.6 410.6L339.03 299.03a66.67 66.67 0 0 0-94.28 0l-88.07 88.07A22.37 22.37 0 0 1 153.6 393zM61.4 205.06l111.56 111.56a66.67 66.67 0 0 1 0 94.28L61.4 205.06zm0 0" fill="currentColor" opacity=".3"/>
    </svg>
  );
}

function PixRow() {
  const [copied, setCopied] = useState(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
    } catch {
      const el = document.createElement('textarea');
      el.value = PIX_KEY;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      onClick={handleCopyPix}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 transition text-left relative overflow-hidden ${copied ? 'bg-fc-limesoft' : 'active:bg-fc-cream'}`}
    >
      <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition ${copied ? 'bg-fc-lime text-fc-dark' : 'bg-[#32BCAD]/15 text-[#32BCAD]'}`}>
        {copied ? <Icon name="check" size={16} /> : <PixLogo size={20} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-fc-ink">{copied ? '✅ Chave Pix copiada!' : 'Pagar mensalidade (PIX)'}</p>
        <p className="text-[11px] text-fc-muted font-normal truncate">
          {copied ? `Chave: ${PIX_KEY_LABEL} — Chicon` : `Toque para copiar: ${PIX_KEY_LABEL}`}
        </p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 transition ${copied ? 'bg-fc-lime/40 text-fc-dark' : 'bg-[#32BCAD]/15 text-[#32BCAD] border border-[#32BCAD]/25'}`}>
        {copied ? 'Copiado!' : 'Pix'}
      </span>
    </button>
  );
}

function InfoToggleRow({ icon, label, open, onToggle, children }) {
  return (
    <div className="px-3 py-2.5">
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-2.5 text-left">
        <span className="w-6 h-6 rounded-full bg-fc-surface flex items-center justify-center text-fc-ink shrink-0">
          <Icon name={icon} size={13} />
        </span>
        <span className="flex-1 text-[12px] text-fc-ink/80 font-medium">{label}</span>
        <Icon name="chevronDown" size={15} className={`text-fc-ink/50 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="text-[11.5px] text-fc-ink/80 font-medium leading-relaxed mt-2 pl-[34px] space-y-2">{children}</div>}
    </div>
  );
}

function InfoStaticRow({ icon, children }) {
  return (
    <div className="px-3 py-2.5 flex items-start gap-2.5">
      <span className="w-6 h-6 rounded-full bg-fc-surface flex items-center justify-center text-fc-ink shrink-0 mt-0.5">
        <Icon name={icon} size={13} />
      </span>
      <p className="text-[11.5px] text-fc-ink/80 font-medium leading-relaxed">{children}</p>
    </div>
  );
}

function PlayerCell({ player: p, canEdit, matchId, statEntry, onAddGoal, onRemoveGoal, onAddAssist, onRemoveAssist, badgesByPlayerId }) {
  const gols = statEntry?.gols || 0;
  const assistencias = statEntry?.assistencias || 0;
  const hasStat = gols > 0 || assistencias > 0;
  const canInteract = canEdit && !!matchId;
  const isEstreante = (badgesByPlayerId?.get(p.id) || []).some((b) => b.id === 'estreante' && b.achieved);

  return (
    <PlayerStatTrigger
      canEdit={canInteract}
      gols={gols}
      assistencias={assistencias}
      onAddGoal={() => onAddGoal(matchId, p.id, p.nome)}
      onAddAssist={() => onAddAssist(matchId, p.id, p.nome)}
      onRemoveGoal={() => onRemoveGoal(matchId, p.id, p.nome)}
      onRemoveAssist={() => onRemoveAssist(matchId, p.id, p.nome)}
      className="w-full flex flex-col items-center"
    >
      <div
        className={`flex flex-col items-center gap-1 md:gap-1.5 rounded-xl px-1 py-1 -m-1 transition ${
          canInteract ? 'active:scale-95 active:bg-fc-cream' : ''
        }`}
      >
        <Avatar nome={p.nome} foto={p.foto} size="w-9 h-9 md:w-12 md:h-12" textSize="text-[10px] md:text-[12px]" />
        <span className="text-[10px] md:text-[12px] font-medium text-fc-ink/80 text-center leading-tight break-words w-full px-0.5 flex items-center justify-center gap-0.5">
          <span>{p.nome}</span>
          {isEstreante && <span title="Estreante (Primeira pelada!)" className="text-[11px] leading-none shrink-0">🐣</span>}
        </span>
        {hasStat && (
          <span className="flex items-center gap-1 flex-wrap justify-center">
            {gols > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] md:text-[10.5px] font-semibold text-white bg-fc-coral rounded-full px-1.5 py-0.5">
                <Icon name="ball" size={8} strokeWidth={2} /> {gols}
              </span>
            )}
            {assistencias > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] md:text-[10.5px] font-semibold text-white bg-fc-dark/70 rounded-full px-1.5 py-0.5">
                <Icon name="assist" size={8} strokeWidth={2.2} /> {assistencias}
              </span>
            )}
          </span>
        )}
      </div>
    </PlayerStatTrigger>
  );
}

function TeamCard({ team, matchId, matchTeam, matchGoals, canEdit, onAddGoal, onRemoveGoal, onAddAssist, onRemoveAssist, onAddResult, onRemoveResult, badgesByPlayerId }) {
  const forca = team.players.length > 0 ? (team.ratingSum / team.players.length).toFixed(2) : '0.00';
  const vitorias = matchTeam?.vitorias || 0;

  return (
    <div className="bg-fc-surface rounded-2xl p-3 md:p-4 border border-fc-line shadow-card">
      <div className="flex items-center justify-between mb-2.5 md:mb-3.5 gap-1.5 flex-wrap">
        <span className="font-semibold text-[14px] md:text-[16px] text-fc-ink shrink-0">{team.name}</span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {matchId && (
            <ResultChip
              icon="trophy"
              label="Vitória"
              shortLabel="Vitória"
              count={vitorias}
              tone="border-fc-lime/50 bg-fc-limesoft text-fc-ink"
              canEdit={canEdit}
              onAdd={() => onAddResult(matchId, team.id, 'vitorias')}
              onRemove={() => onRemoveResult(matchId, team.id, 'vitorias')}
            />
          )}
          <span className="text-[11px] md:text-[12.5px] font-medium text-fc-ink/60 bg-fc-cream px-2.5 py-1 rounded-full shrink-0">Força {forca}</span>
        </div>
      </div>
      <div
        className="grid gap-y-2.5 md:gap-y-4 gap-x-1 md:gap-x-2"
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
            badgesByPlayerId={badgesByPlayerId}
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
  isRealAdmin,
  canEditStats,
  matchLocked,
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
  onRequestFinalize,
  presencaProps,
  badgesByPlayerId,
  showSummaryDash,
  summaryMatch,
  onStartNextFut,
}) {
  const goleirosPresentes = players.filter((p) => p.statusPresenca && p.posicaoFixa === 'Goleiro');
  const showPixCard = !isAdmin || isViewer;
  const [showDuvidas, setShowDuvidas] = useState(false);
  const totalLinePlayers = generatedTeams.reduce((sum, t) => sum + t.players.length, 0);

  if (showSummaryDash && summaryMatch) {
    return (
      <MatchSummaryDash
        match={summaryMatch}
        players={players}
        isAdmin={isAdmin}
        isViewer={isViewer}
        canEditStats={canEditStats}
        onStartNextFut={onStartNextFut}
        onAddGoal={onAddGoal}
        onRemoveGoal={onRemoveGoal}
        onAddAssist={onAddAssist}
        onRemoveAssist={onRemoveAssist}
        onAddResult={onAddResult}
        onRemoveResult={onRemoveResult}
      />
    );
  }

  if (!teamsDrafted && isAdmin && presencaProps) {
    return <PresencaTab {...presencaProps} />;
  }

  return (
    <div className="space-y-2.5">
      <div className="bg-fc-surface rounded-2xl border border-fc-line shadow-card divide-y divide-fc-line">
        {showPixCard && <PixRow />}

        {teamsDrafted ? (
          <button onClick={onCopyTeams} title={copied ? 'Copiado!' : 'Copiar os times'} className="w-full flex items-center gap-3 px-3.5 py-2.5 active:bg-fc-cream transition text-left">
            <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition ${copied ? 'bg-fc-lime text-fc-ink' : 'bg-fc-limesoft text-fc-ink'}`}>
              <Icon name={copied ? 'check' : 'copy'} size={15} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-fc-ink">Times escalados</p>
              <p className="text-[11px] text-fc-muted truncate">
                {generatedTeams.length} times, {totalLinePlayers} jogadores + {goleirosPresentes.length} goleiros
              </p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3 px-3.5 py-2.5">
            <span className="w-9 h-9 rounded-full bg-fc-limesoft flex items-center justify-center text-fc-ink shrink-0">
              <Icon name="copy" size={15} />
            </span>
            <p className="text-[13px] font-semibold text-fc-ink">Time vai ser tirado jajá</p>
          </div>
        )}
      </div>

      <div className="bg-fc-limesoft/50 rounded-2xl divide-y divide-fc-ink/10">
        <InfoToggleRow icon="target" label="Dúvidas? Como funciona o sorteio e a contagem de gols" open={showDuvidas} onToggle={() => setShowDuvidas((v) => !v)}>
          <p>
            <span className="font-semibold text-fc-ink">Sorteio:</span> cada jogador tem uma nota média, formada pela nota dada por 3 avaliadores — é essa média que vira o nível do jogador. Os times saem balanceados por nível e evitam repetir as mesmas duplas dos últimos jogos, pra ninguém cair sempre no time fraco (ou sempre no forte). Como o Time 1 e o Time 2 sempre começam jogando, eles ficam com os times de menor força — os mais fortes (3 e/ou 4) começam esperando a vez. Cada partida dura até 7 min (ou 2 gols), num rodízio de 1 hora de jogo.
          </p>
          <p>
            <span className="font-semibold text-fc-ink">Gols e assistências:</span> qualquer um pode marcar gol, assistência e vitória: toque no nome de quem fez gol ou deu assistência (dois toques rápidos tiram a marcação), e use o botão de vitória no topo de cada time — tirar uma vitória pede uma segunda confirmação. Essas marcações ficam abertas pra edição até um ADM finalizar o jogo ou até passar 1 dia da hora em que o time foi tirado, o que vier primeiro. Depois disso, só ADM consegue editar.
          </p>
        </InfoToggleRow>

        {matchLocked && teamsDrafted && !isRealAdmin && (
          <InfoStaticRow icon="lock">
            Esse jogo está {currentMatch?.finalizado ? 'finalizado' : 'com a edição encerrada (mais de 1 dia)'}. Só ADMs conseguem editar gols, assistências e vitórias agora.
          </InfoStaticRow>
        )}

        {canEditStats && teamsDrafted && (
          <InfoStaticRow icon="info">
            Toque no nome de quem fez gol ou deu assistência. Já marcou? Dois toques rápidos no nome tiram a marcação. O botão de vitória fica no topo de cada time.
          </InfoStaticRow>
        )}
      </div>

      {teamsDrafted && generatedTeams.length > 0 ? (
        <div className="space-y-2 md:space-y-0 md:grid md:gap-3 md:items-start md:[grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {generatedTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              matchId={currentMatch?.id}
              matchTeam={currentMatch?.teams.find((t) => t.id === team.id)}
              matchGoals={currentMatch?.goals}
              canEdit={canEditStats}
              onAddGoal={onAddGoal}
              onRemoveGoal={onRemoveGoal}
              onAddAssist={onAddAssist}
              onRemoveAssist={onRemoveAssist}
              onAddResult={onAddResult}
              onRemoveResult={onRemoveResult}
              badgesByPlayerId={badgesByPlayerId}
            />
          ))}
        </div>
      ) : (
        <div className="bg-fc-surface rounded-2xl p-8 border border-fc-line shadow-card flex flex-col items-center gap-2.5 text-center">
          <Icon name="shield" size={26} className="text-fc-muted" strokeWidth={1.4} />
          <p className="text-[12px] text-fc-muted">Os times aparecem aqui, lado a lado, assim que forem sorteados.</p>
        </div>
      )}

      {teamsDrafted && (
        <div className="bg-fc-surface rounded-2xl px-3.5 py-2.5 border border-fc-line shadow-card flex items-center flex-wrap gap-x-2 gap-y-1">
          <span className="text-[12px] font-medium text-fc-muted flex items-center gap-1.5 shrink-0">
            <Icon name="gloves" size={14} /> Goleiros
          </span>
          {goleirosPresentes.length === 0 ? (
            <span className="text-[12px] text-fc-muted">Nenhum confirmado.</span>
          ) : (
            <span className="flex flex-wrap gap-x-1 text-[12px] text-fc-ink font-medium">
              {goleirosPresentes.map((g, i) => (
                <span key={g.id}>
                  {g.nome}
                  {i < goleirosPresentes.length - 1 ? ',' : ''}
                </span>
              ))}
            </span>
          )}
        </div>
      )}

      {isRealAdmin && teamsDrafted && currentMatch && !currentMatch.finalizado && (
        <div>
          <button
            onClick={onRequestFinalize}
            className="w-full bg-fc-surface hover:bg-fc-cream border border-fc-line text-fc-ink font-medium py-3 rounded-xl text-[13px] transition flex items-center justify-center gap-2"
          >
            <Icon name="lock" size={15} /> Finalizar jogo
          </button>
        </div>
      )}
    </div>
  );
}
