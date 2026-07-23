import Icon from './Icon';
import { ADMIN_LABELS } from '../utils/adminLabels';

export default function Header({ isAdmin, currentAdmin, onLogoClick, onLeaveAdmin }) {
  const isViewerRole = currentAdmin === 'visualização';

  return (
    <header className="sticky top-0 bg-fc-dark text-white pt-3.5 pb-7 px-3.5 flex flex-col items-center justify-between z-40 shadow-nav overflow-hidden rounded-b-[28px]">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-fc-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center justify-center w-full max-w-md relative">
        <div onClick={onLogoClick} className="cursor-pointer py-1 px-2 rounded-xl active:scale-95 transition">
          <img src="/logo.png" alt="Futebol Cefas" className="h-14 w-auto drop-shadow-md" />
        </div>

        {isAdmin && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <span className="bg-white/10 text-white/80 text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
              {isViewerRole ? <Icon name="eye" size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-fc-lime" />}
              {ADMIN_LABELS[currentAdmin] || 'ADM'}
            </span>
            <button
              onClick={onLeaveAdmin}
              title="Sair"
              className="w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white/70 rounded-full transition"
            >
              <Icon name="logout" size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
