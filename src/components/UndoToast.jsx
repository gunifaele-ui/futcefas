import Icon from './Icon';

export default function UndoToast({ state, onUndo }) {
  if (!state) return null;

  return (
    <div className="fixed bottom-24 left-3 right-3 max-w-md mx-auto z-40" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-fc-dark text-white rounded-2xl shadow-nav pl-4 pr-2 py-2.5 flex items-center gap-3">
        <span className="flex-1 min-w-0 text-[12.5px] font-medium truncate">{state.message}</span>
        <button
          onClick={onUndo}
          className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-fc-lime font-semibold text-[12.5px] px-3 py-1.5 rounded-xl transition active:scale-95"
        >
          <Icon name="refresh" size={13} />
          Desfazer
        </button>
      </div>
    </div>
  );
}
