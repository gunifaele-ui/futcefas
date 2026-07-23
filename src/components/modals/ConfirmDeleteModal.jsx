import { useState } from 'react';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

const CONFIRM_WORD = 'apagar';

export default function ConfirmDeleteModal({ title, message, onConfirm, onClose }) {
  const [typed, setTyped] = useState('');
  const canConfirm = typed.trim().toLowerCase() === CONFIRM_WORD;

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-fc-dark mb-1 flex items-center gap-2">
        <Icon name="trash" size={16} className="text-fc-coraldark" /> {title}
      </h3>
      <p className="text-[12px] text-fc-muted mb-4 leading-relaxed">{message}</p>

      <p className="text-[12px] text-fc-dark/70 mb-2">
        Digite <span className="text-fc-coraldark font-semibold">"apagar"</span> pra confirmar:
      </p>
      <input
        type="text"
        placeholder="apagar"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="w-full bg-fc-cream border border-fc-line rounded-xl py-3 px-4 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium transition"
        autoFocus
      />

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-fc-cream hover:bg-fc-line text-fc-dark/70 font-medium py-3 rounded-xl text-[13px] transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          className="flex-1 bg-fc-coral hover:bg-fc-coraldark disabled:opacity-40 text-white font-medium py-3 rounded-xl text-[13px] transition"
        >
          Excluir
        </button>
      </div>
    </BottomSheet>
  );
}
