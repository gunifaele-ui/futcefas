import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

export default function AddAvulsoModal({ newAvulsoName, setNewAvulsoName, onSubmit, onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-fc-dark mb-1 flex items-center gap-2">
        <Icon name="plus" size={16} className="text-fc-dark/60" /> Adicionar avulso
      </h3>
      <p className="text-[12px] text-fc-muted mb-4">O avulso entra na lista já confirmado com nota padrão 7.0.</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nome do jogador avulso"
          value={newAvulsoName}
          onChange={(e) => setNewAvulsoName(e.target.value)}
          className="w-full bg-fc-cream border border-fc-line rounded-xl py-3 px-4 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium transition"
          autoFocus
        />

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
