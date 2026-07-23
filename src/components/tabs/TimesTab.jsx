import Avatar from '../Avatar';

function TeamCard({ team }) {
  const forca = team.players.length > 0 ? (team.ratingSum / team.players.length).toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-3xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="font-black text-sm text-fc-dark">{team.name}</span>
        <span className="text-[10px] font-black text-fc-dark bg-fc-limesoft px-2.5 py-1 rounded-full">Força {forca}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {team.players.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-1 w-14 shrink-0">
            <Avatar nome={p.nome} foto={p.foto} size="w-10 h-10" textSize="text-[10px]" />
            <span className="text-[9px] font-bold text-fc-dark text-center leading-tight break-words w-full">{p.nome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimesTab({ players, generatedTeams, teamsDrafted, isAdmin, isViewer, copied, onCopyTeams, onResetTeams, onOpenResultModal }) {
  const goleirosPresentes = players.filter((p) => p.statusPresenca && p.posicaoFixa === 'Goleiro');

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-4 shadow-sm relative">
        <div className="text-center">
          <span className="text-2xl">{teamsDrafted ? '🏆' : '⏳'}</span>
          <h2 className="text-sm font-black text-fc-dark uppercase tracking-tight mt-1">
            {teamsDrafted ? 'TIMES ESCALADOS' : 'TIME VAI SER TIRADO JAJÁ'}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {teamsDrafted ? 'Escalação pronta pro futebol de hoje.' : 'Aguardando o ADM confirmar a lista e fazer o sorteio.'}
          </p>
        </div>

        {teamsDrafted && (
          <button
            onClick={onCopyTeams}
            title={copied ? 'Copiado!' : 'Copiar os times'}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm active:scale-95 transition ${copied ? 'bg-fc-lime text-fc-dark' : 'bg-fc-limesoft/60 hover:bg-fc-limesoft text-fc-dark border border-fc-limesoft'}`}
          >
            {copied ? '✅' : '📋'}
          </button>
        )}
      </div>

      {teamsDrafted && generatedTeams.length > 0 ? (
        <div className="space-y-2.5">
          {generatedTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center gap-2 text-center">
          <span className="text-3xl">🛡️</span>
          <p className="text-xs text-slate-400 font-bold">Os times aparecem aqui, lado a lado, assim que forem sorteados.</p>
        </div>
      )}

      {teamsDrafted && (
        <div className="bg-white rounded-3xl p-3.5 shadow-sm">
          <span className="text-[9px] font-black uppercase tracking-wider text-fc-coraldark bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
            🧤 Goleiros
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {goleirosPresentes.length === 0 ? (
              <span className="text-[10px] text-slate-400 italic">Nenhum goleiro confirmado.</span>
            ) : (
              goleirosPresentes.map((g) => (
                <span key={g.id} className="bg-orange-50 border border-orange-100 text-fc-coraldark text-[10px] font-black pl-1 pr-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Avatar nome={g.nome} foto={g.foto} size="w-5 h-5" textSize="text-[7px]" />
                  {g.nome}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {isAdmin && !isViewer && teamsDrafted && (
        <div className="pt-2 space-y-2">
          <button
            onClick={onOpenResultModal}
            className="w-full bg-fc-dark hover:bg-fc-dark2 text-white font-black py-3 rounded-full text-xs uppercase tracking-wider shadow-sm active:scale-95 transition"
          >
            📊 Registrar Resultado do Dia
          </button>
          <button
            onClick={onResetTeams}
            className="w-full bg-fc-coral hover:bg-fc-coraldark text-white font-black py-3 rounded-full text-xs uppercase tracking-wider shadow-sm active:scale-95 transition"
          >
            🔄 Nova Chamada (Resetar Times)
          </button>
        </div>
      )}
    </div>
  );
}
