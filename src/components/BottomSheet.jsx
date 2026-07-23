export default function BottomSheet({ onClose, children }) {
  return (
    <div
      className="fc-modal-backdrop fixed inset-0 bg-fc-dark/30 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="fc-sheet bg-white w-full max-w-md rounded-t-[28px] shadow-nav p-5 max-h-[88vh] overflow-y-auto"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 rounded-full bg-fc-line mx-auto mb-4" />
        {children}
      </div>
    </div>
  );
}
