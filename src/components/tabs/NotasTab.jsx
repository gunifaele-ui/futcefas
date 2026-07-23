import { useState } from 'react';
import Avatar from '../Avatar';
import { ratingTone } from '../../utils/playerVisuals';

const SUBTABS = [
  { key: 'Mensalista', label: 'Mensalistas' },
  { key: 'Avulso', label: 'Avulsos' },
];

export default function NotasTab({ players, onOpenRatingModal, onChangeCategory, onDeletePlayer }) {
  const [subTab, setSubTab] = useState('Mensalista');

  const list = players.filter((p) => p.posicaoFixa === 'Linha' && p.tipo === subTab);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <h2 className="text-base font-black text-fc-dark tracking-tight">Mudar nota</h2>
        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Painel dos ADMs Gustavo, Enzo e Miguel.</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
        {SUBTABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`flex-1 text-[11px] font-black py-1.5 rounded-xl transition ${
              subTab === tab.key ? 'bg-white text-fc-dark shadow-sm' : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {list.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Nenhum jogador nessa categoria.</p>
        ) : (
          list.map((p) => {
            const tone = ratingTone(p.notaMedia);
            return (
              <div key={p.id} className="bg-white rounded-xl px-2.5 py-2 flex items-center gap-2 shadow-sm">
                <Avatar nome={p.nome} size="w-8 h-8" textSize="text-[8px]" />
                <span className="text-xs font-black text-fc-dark break-words min-w-0 flex-1">{p.nome}</span>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 ${tone.text} ${tone.bg} border ${tone.border}`}>
                  {p.notaMedia.toFixed(2)}
                </span>
                <select
                  value={p.tipo === 'Avulso' ? 'Avulso' : p.posicaoFixa === 'Goleiro' ? 'Goleiro' : 'Mensalista'}
                  onChange={(e) => onChangeCategory(p.id, e.target.value)}
                  className="text-[9px] font-bold border border-slate-200 rounded-lg px-1 py-1.5 bg-fc-cream text-slate-600 shrink-0 focus:outline-none"
                  title="Mudar categoria"
                >
                  <option value="Mensalista">Jogador</option>
                  <option value="Avulso">Avulso</option>
                  <option value="Goleiro">Goleiro</option>
                </select>
                <button
                  onClick={() => onOpenRatingModal(p)}
                  className="bg-fc-dark hover:bg-fc-dark2 text-white text-xs w-7 h-7 rounded-lg active:scale-95 transition shrink-0 shadow-sm flex items-center justify-center"
                  title="Editar nota"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDeletePlayer(p.id)}
                  className="bg-fc-coral hover:bg-fc-coraldark text-white text-xs w-7 h-7 rounded-lg active:scale-95 transition shrink-0 shadow-sm flex items-center justify-center"
                  title="Excluir jogador"
                >
                  🗑️
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
