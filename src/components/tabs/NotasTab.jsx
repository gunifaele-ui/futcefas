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
    neutral: 'bg-fc-cream hover:bg-fc-line text-fc-dark/70',
    dark: 'bg-fc-dark hover:bg-fc-dark2 text-white',
    danger: 'bg-white hover:bg-orange-50 border border-fc-line text-fc-coraldark',
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

export default function NotasTab({ players, admins, isViewer, onOpenRatingModal, onChangeCategory, onDeletePlayer, onOpenAddPlayer, onOpenEditPlayer }) {
  const [subTab, setSubTab] = useState('Mensalista');

  const list =
    subTab === 'Goleiro' ? players.filter((p) => p.posicaoFixa === 'Goleiro') : players.filter((p) => p.posicaoFixa === 'Linha' && p.tipo === subTab);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold text-fc-dark tracking-tight">Mudar nota</h2>
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

      <div className="flex gap-1 bg-white border border-fc-line p-1 rounded-xl">
        {SUBTABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`flex-1 text-[12px] py-1.5 rounded-lg transition ${
              subTab === tab.key ? 'bg-fc-limesoft text-fc-dark font-semibold' : 'text-fc-muted font-medium'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {list.length === 0 ? (
          <p className="text-[12px] text-fc-muted text-center py-6">Nenhum jogador nessa categoria.</p>
        ) : (
          list.map((p) => {
            const isGoleiro = p.posicaoFixa === 'Goleiro';
            const tone = !isGoleiro ? ratingTone(p.notaMedia) : null;
            const missing = !isGoleiro ? missingRaterLabels(p, admins) : [];
            return (
              <div key={p.id} className="bg-white rounded-xl px-2.5 py-2 flex items-center gap-2 border border-fc-line">
                <Avatar nome={p.nome} foto={p.foto} size="w-8 h-8" textSize="text-[9px]" />
                <span className="text-[13px] font-medium text-fc-dark break-words min-w-0 flex-1 flex items-center gap-1">
                  {missing.length > 0 && (
                    <span title={`Falta nota de: ${missing.join(', ')}`} className="shrink-0 text-fc-coraldark">
                      <Icon name="alertTriangle" size={12} />
                    </span>
                  )}
                  {p.nome}
                </span>
                {!isGoleiro && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${tone.text} ${tone.bg} ${tone.border}`}>
                    {p.notaMedia.toFixed(2)}
                  </span>
                )}
                {!isViewer && (
                  <select
                    value={p.tipo === 'Avulso' ? 'Avulso' : p.posicaoFixa === 'Goleiro' ? 'Goleiro' : 'Mensalista'}
                    onChange={(e) => onChangeCategory(p.id, e.target.value)}
                    className="text-[10px] font-medium border border-fc-line rounded-lg px-1 py-1.5 bg-fc-cream text-fc-dark/70 shrink-0 focus:outline-none"
                    title="Mudar categoria"
                  >
                    <option value="Mensalista">Mensal</option>
                    <option value="Avulso">Avulso</option>
                    <option value="Goleiro">Goleiro</option>
                  </select>
                )}
                {!isViewer && <IconButton onClick={() => onOpenEditPlayer(p)} title="Editar nome/foto" icon="image" />}
                {!isGoleiro && !isViewer && <IconButton onClick={() => onOpenRatingModal(p)} title="Editar nota" icon="pencil" tone="dark" />}
                {!isViewer && <IconButton onClick={() => onDeletePlayer(p.id)} title="Excluir jogador" icon="trash" tone="danger" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
