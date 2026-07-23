import { useState } from 'react';
import Avatar from '../Avatar';
import Icon from '../Icon';

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

function TeamCard({ team }) {
  const forca = team.players.length > 0 ? (team.ratingSum / team.players.length).toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card">
      <div className="flex items-center justify-between mb-3.5">
        <span className="font-semibold text-[14px] text-fc-dark">{team.name}</span>
        <span className="text-[11px] font-medium text-fc-dark/60 bg-fc-cream px-2.5 py-1 rounded-full">Força {forca}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {team.players.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1.5 w-14 shrink-0">
            <Avatar nome={p.nome} foto={p.foto} size="w-10 h-10" textSize="text-[10px]" />
            <span className="text-[10px] font-medium text-fc-dark/80 text-center leading-tight break-words w-full">{p.nome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimesTab({ players, generatedTeams, teamsDrafted, isAdmin, isViewer, copied, onCopyTeams, onResetTeams, onGoToHistory }) {
  const goleirosPresentes = players.filter((p) => p.statusPresenca && p.posicaoFixa === 'Goleiro');
  const showPixCard = !isAdmin || isViewer;

  return (
    <div className="space-y-3">
      {showPixCard && <PixCard />}

      <div className="bg-white rounded-2xl p-5 border border-fc-line shadow-card relative">
        <div className="text-center">
          <span className="inline-flex w-10 h-10 rounded-full bg-fc-cream items-center justify-center text-fc-dark/70 mb-2">
            <Icon name={teamsDrafted ? 'trophy' : 'clock'} size={19} />
          </span>
          <h2 className="text-[15px] font-semibold text-fc-dark tracking-tight">
            {teamsDrafted ? 'Times escalados' : 'Time vai ser tirado jajá'}
          </h2>
          {teamsDrafted && <p className="text-[12px] text-fc-muted mt-0.5">Escalação pronta pro futebol de hoje.</p>}
        </div>

        {teamsDrafted && (
          <button
            onClick={onCopyTeams}
            title={copied ? 'Copiado!' : 'Copiar os times'}
            className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center transition ${
              copied ? 'bg-fc-lime text-fc-dark' : 'bg-fc-cream hover:bg-fc-limesoft text-fc-dark/70'
            }`}
          >
            <Icon name={copied ? 'check' : 'copy'} size={16} />
          </button>
        )}
      </div>

      <div className="bg-fc-limesoft/50 rounded-2xl px-3.5 py-2.5 flex items-start gap-2.5">
        <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-fc-dark shrink-0 mt-0.5">
          <Icon name="target" size={12} />
        </span>
        <p className="text-[11px] text-fc-dark/80 font-medium leading-snug">
          Sorteio justo: os times saem balanceados por nível e evitam repetir as mesmas duplas dos últimos jogos, pra ninguém cair sempre no time fraco (ou sempre no forte).
        </p>
      </div>

      {teamsDrafted && generatedTeams.length > 0 ? (
        <div className="space-y-3">
          {generatedTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
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
