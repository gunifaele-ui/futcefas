import { useState } from 'react';
import Avatar from '../Avatar';
import Icon from '../Icon';
import { ratingTone } from '../../utils/playerVisuals';
import { missingRaterLabels } from '../../utils/ratings';

const SUBTABS = [
  { key: 'Mensalista', label: 'Mensalistas' },
  { key: 'Avulso', label: 'Avulsos' },
  { key: 'Goleiro', label: 'Goleiros' },
];

function IconButton({ onClick, title, icon, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-fc-cream hover:bg-fc-line text-fc-ink/70',
    dark: 'bg-fc-dark hover:bg-fc-dark2 text-white',
    danger: 'bg-fc-surface hover:bg-fc-coral/10 border border-fc-line text-fc-coraldark',
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-lg active:scale-95 transition shrink-0 flex items-center justify-center ${tones[tone]}`}
    >
      <Icon name={icon} size={14} />
    </button>
  );
}

export default function NotasTab({
  players,
  admins,
  isViewer,
  badgesByPlayerId,
  onOpenProfile,
  onOpenRatingModal,
  onChangeCategory,
  onDeletePlayer,
  onOpenAddPlayer,
  onOpenEditPlayer,
}) {
  const [subTab, setSubTab] = useState('Mensalista');
  const [sortMode, setSortMode] = useState('nota');

  const list =
    subTab === 'Goleiro' ? players.filter((p) => p.posicaoFixa === 'Goleiro') : players.filter((p) => p.posicaoFixa === 'Linha' && p.tipo === subTab);

  const sortedList = [...list].sort((a, b) =>
    sortMode === 'nota' ? (b.notaMedia ?? 0) - (a.notaMedia ?? 0) : a.nome.localeCompare(b.nome, 'pt-BR')
  );

  const counts = {
    Mensalista: players.filter((p) => p.posicaoFixa === 'Linha' && p.tipo === 'Mensalista').length,
    Avulso: players.filter((p) => p.posicaoFixa === 'Linha' && p.tipo === 'Avulso').length,
    Goleiro: players.filter((p) => p.posicaoFixa === 'Goleiro').length,
  };

  return (
    <div className="space-y-3">
      <div className="bg-fc-surface rounded-2xl p-4 shadow-card flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold text-fc-ink tracking-tight">Mudar nota</h2>
          <p className="text-[11px] text-fc-muted mt-0.5">Nota média formada pela média das notas dos ADMs.</p>
        </div>
        {!isViewer && (
          <button
            onClick={() => onOpenAddPlayer(subTab)}
            className="bg-fc-dark hover:bg-fc-dark2 text-white text-[12px] font-medium pl-2.5 pr-3 py-2 rounded-xl active:scale-95 transition shrink-0 flex items-center gap-1"
          >
            <Icon name="plus" size={14} /> Jogador
          </button>
        )}
      </div>

      <div className="flex gap-1 bg-fc-surface border border-fc-line p-1 rounded-xl">
        {SUBTABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`flex-1 text-[12px] py-1.5 rounded-lg transition ${
              subTab === tab.key ? 'bg-fc-limesoft text-fc-ink font-semibold' : 'text-fc-muted font-medium'
            }`}
          >
            {tab.label} <span className="font-normal text-fc-muted/60">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-end gap-1.5 px-0.5">
        <span className="text-[10.5px] text-fc-muted font-medium">Ordenar</span>
        <div className="flex gap-0.5 bg-fc-surface border border-fc-line p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setSortMode('nome')}
            className={`text-[10.5px] px-2 py-1 rounded-md transition ${
              sortMode === 'nome' ? 'bg-fc-limesoft text-fc-ink font-semibold' : 'text-fc-muted font-medium'
            }`}
          >
            A-Z
          </button>
          <button
            type="button"
            onClick={() => setSortMode('nota')}
            className={`text-[10.5px] px-2 py-1 rounded-md transition ${
              sortMode === 'nota' ? 'bg-fc-limesoft text-fc-ink font-semibold' : 'text-fc-muted font-medium'
            }`}
          >
            Nota
          </button>
        </div>
      </div>

      <div className="space-y-1.5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-1.5 lg:items-start">
        {sortedList.length === 0 ? (
          <p className="text-[12px] text-fc-muted text-center py-6 lg:col-span-2">Nenhum jogador nessa categoria.</p>
        ) : (
          sortedList.map((p) => {
            const isGoleiro = p.posicaoFixa === 'Goleiro';
            const tone = !isGoleiro ? ratingTone(p.notaMedia) : null;
            const missing = !isGoleiro ? missingRaterLabels(p, admins) : [];
            const playerBadges = badgesByPlayerId?.get(p.id) || [];
            const hasEvolucao = playerBadges.some((b) => b.id === 'em_alta' && b.achieved);

            return (
              <div key={p.id} className="bg-fc-surface rounded-xl px-2.5 py-2 flex items-center gap-2 shadow-xs">
                <button
                  type="button"
                  onClick={() => onOpenProfile(p)}
                  className="flex items-center gap-2 min-w-0 flex-1 text-left active:opacity-70 transition group"
                >
                  <Avatar nome={p.nome} foto={p.foto} size="w-8 h-8" textSize="text-[9px]" />

                  <span className="text-[13px] font-semibold text-fc-ink truncate flex-1 min-w-0 pr-1 flex items-center gap-1">
                    <span className="truncate">{p.nome}</span>
                    {missing.length > 0 && (
                      <span title={`Falta nota de: ${missing.join(', ')}`} className="shrink-0 text-fc-coraldark">
                        <Icon name="alertTriangle" size={11} />
                      </span>
                    )}
                  </span>
                </button>
                {!isGoleiro && (
                  <div className="flex items-center gap-1 shrink-0">
                    {hasEvolucao && (
                      <span title="Evolução de Nota! Subiu em relação ao futebol anterior." className="text-[13px] leading-none shrink-0">
                        📈
                      </span>
                    )}
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${tone.text} ${tone.bg} ${tone.border}`}>
                      {p.notaMedia != null ? p.notaMedia.toFixed(2) : '—'}
                    </span>
                  </div>
                )}
                {!isViewer && (
                  <select
                    value={p.tipo === 'Avulso' ? 'Avulso' : p.posicaoFixa === 'Goleiro' ? 'Goleiro' : 'Mensalista'}
                    onChange={(e) => onChangeCategory(p.id, e.target.value)}
                    className="text-[10px] font-medium border border-fc-line rounded-lg px-1 py-1.5 bg-fc-cream text-fc-ink/70 shrink-0 focus:outline-none"
                    title="Mudar categoria"
                  >
                    <option value="Mensalista">Mensal</option>
                    <option value="Avulso">Avulso</option>
                    <option value="Goleiro">Goleiro</option>
                  </select>
                )}
                {!isViewer && <IconButton onClick={() => onOpenEditPlayer(p)} title="Editar nome/foto" icon="settings" />}
                {!isGoleiro && !isViewer && <IconButton onClick={() => onOpenRatingModal(p)} title="Editar nota" icon="clipboard" tone="dark" />}
                {!isViewer && <IconButton onClick={() => onDeletePlayer(p.id)} title="Excluir jogador" icon="trash" tone="danger" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
