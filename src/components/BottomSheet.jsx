export default function BottomSheet({ onClose, children }) {
  return (
    <div
      className="fc-modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="fc-sheet bg-white w-full max-w-md rounded-t-[32px] shadow-2xl p-5 max-h-[88vh] overflow-y-auto"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 rounded-full bg-slate-200 mx-auto mb-4" />
        {children}
      </div>
    </div>
  );
}
