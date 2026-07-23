import Icon from './Icon';
import { getAdminLabel } from '../utils/adminLabels';

export default function DraftNotification({ notice, admins, onView, onDismiss }) {
  if (!notice) return null;
  const adminLabel = getAdminLabel(admins, notice.adminKey) || 'Alguém';

  return (
    <div className="fixed top-20 left-3 right-3 max-w-md mx-auto z-50">
      <div className="bg-fc-dark text-white rounded-2xl shadow-nav p-3.5 flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <Icon name="ball" size={18} />
        </span>
        <button onClick={onView} className="flex-1 min-w-0 text-left">
          <p className="text-[13px] font-semibold">Time tirado!</p>
          <p className="text-[11px] text-white/60">{adminLabel} tirou o time agora. Toque pra ver.</p>
        </button>
        <button
          onClick={onDismiss}
          title="Fechar"
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition shrink-0"
        >
          <Icon name="plus" size={14} className="rotate-45" />
        </button>
      </div>
    </div>
  );
}
