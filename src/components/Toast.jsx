export default function Toast({ alert }) {
  if (!alert.show) return null;

  return (
    <div className="fc-toast fixed top-3 right-3 z-50 max-w-[85vw] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border bg-white/95 backdrop-blur border-fc-limesoft">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
        alert.type === 'success' ? 'bg-fc-limesoft text-fc-dark' :
        alert.type === 'error' ? 'bg-orange-100 text-fc-coraldark' : 'bg-sky-100 text-sky-700'
      }`}>
        {alert.type === 'success' ? '✓' : alert.type === 'error' ? '!' : 'i'}
      </span>
      <span className="text-[10px] font-bold text-slate-700 truncate min-w-0">{alert.message}</span>
    </div>
  );
}
