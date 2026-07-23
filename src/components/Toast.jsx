import Icon from './Icon';

const TONES = {
  success: { bg: 'bg-fc-limesoft', text: 'text-fc-dark', icon: 'check' },
  error: { bg: 'bg-orange-50', text: 'text-fc-coraldark', icon: 'minus' },
  info: { bg: 'bg-fc-cream', text: 'text-fc-dark/70', icon: 'check' },
};

export default function Toast({ alert }) {
  if (!alert.show) return null;
  const tone = TONES[alert.type] || TONES.info;

  return (
    <div className="fc-toast fixed top-3 right-3 z-50 max-w-[85vw] pl-1.5 pr-3 py-1.5 rounded-full shadow-card flex items-center gap-2 border border-fc-line bg-white/95 backdrop-blur">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${tone.bg} ${tone.text}`}>
        <Icon name={tone.icon} size={11} strokeWidth={2.5} />
      </span>
      <span className="text-[12px] font-medium text-fc-dark truncate min-w-0">{alert.message}</span>
    </div>
  );
}
