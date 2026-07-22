import BottomSheet from '../BottomSheet';

export default function AddAvulsoModal({ newAvulsoName, setNewAvulsoName, onSubmit, onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      <h3 className="font-black text-sm text-fc-dark mb-1">➕ Adicionar Avulso</h3>
      <p className="text-[11px] text-slate-400 mb-3 font-bold">O avulso entra na lista já confirmado com nota padrão 7.0.</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nome do jogador avulso"
          value={newAvulsoName}
          onChange={(e) => setNewAvulsoName(e.target.value)}
          className="w-full bg-fc-cream border border-slate-200 rounded-2xl py-3 px-4 text-xs text-fc-dark focus:outline-none focus:border-fc-dark focus:ring-2 focus:ring-fc-lime/40 font-bold transition"
          autoFocus
        />

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
