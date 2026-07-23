import { useState } from 'react';
import BottomSheet from '../BottomSheet';

export default function AddPlayerModal({ defaultCategory, onSubmit, onClose }) {
  const [nome, setNome] = useState('');
  const [category, setCategory] = useState(defaultCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSubmit(nome.trim(), category);
  };

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="font-black text-sm text-fc-dark mb-1">➕ Adicionar Jogador</h3>
      <p className="text-[11px] text-slate-400 mb-3 font-bold">Entra na lista sem presença marcada.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nome do jogador"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-fc-cream border border-slate-200 rounded-2xl py-3 px-4 text-xs text-fc-dark focus:outline-none focus:border-fc-dark focus:ring-2 focus:ring-fc-lime/40 font-bold transition"
          autoFocus
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-fc-cream border border-slate-200 rounded-2xl py-3 px-4 text-xs text-fc-dark font-bold focus:outline-none focus:border-fc-dark"
        >
          <option value="Mensalista">Jogador (Mensalista)</option>
          <option value="Avulso">Avulso</option>
          <option value="Goleiro">Goleiro</option>
        </select>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-full text-xs transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-fc-lime hover:brightness-95 text-fc-dark font-black py-3 rounded-full text-xs transition shadow-sm"
          >
            Adicionar
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
