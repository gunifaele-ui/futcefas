import { useState } from 'react';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

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
      <h3 className="text-[15px] font-semibold text-fc-dark mb-1 flex items-center gap-2">
        <Icon name="plus" size={16} className="text-fc-dark/60" /> Adicionar jogador
      </h3>
      <p className="text-[12px] text-fc-muted mb-4">Entra na lista sem presença marcada.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nome do jogador"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-fc-cream border border-fc-line rounded-xl py-3 px-4 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium transition"
          autoFocus
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-fc-cream border border-fc-line rounded-xl py-3 px-4 text-[13px] text-fc-dark font-medium focus:outline-none focus:border-fc-dark/30"
        >
          <option value="Mensalista">Jogador (mensalista)</option>
          <option value="Avulso">Avulso</option>
          <option value="Goleiro">Goleiro</option>
        </select>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-fc-cream hover:bg-fc-line text-fc-dark/70 font-medium py-3 rounded-xl text-[13px] transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-fc-dark hover:bg-fc-dark2 text-white font-medium py-3 rounded-xl text-[13px] transition"
          >
            Adicionar
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
