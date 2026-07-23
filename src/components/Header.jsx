import Icon from './Icon';
import { getAdminLabel } from '../utils/adminLabels';

export default function Header({ isAdmin, currentAdmin, admins, onLogoClick, onLeaveAdmin, hasUnreadActivity, onOpenActivityLog, onOpenSettings }) {
  const isViewerRole = currentAdmin === 'visualização';

  return (
    <header className="sticky top-0 bg-fc-dark text-white pt-3.5 pb-7 px-3.5 flex flex-col items-center justify-between z-40 shadow-nav overflow-hidden rounded-b-[28px]">
      <div className="absolute top-4 -right-10 w-40 h-40 bg-fc-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center w-full max-w-md gap-1.5">
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          {isAdmin && !isViewerRole && (
            <>
              <button
                onClick={onOpenActivityLog}
                title="Notificações"
                className="relative w-8 h-8 shrink-0 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white/80 rounded-full transition"
              >
                <Icon name="bell" size={15} />
                {hasUnreadActivity && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-fc-lime border border-fc-dark" />
                )}
              </button>
              <button
                onClick={onOpenSettings}
                title="Configurações"
                className="w-8 h-8 shrink-0 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white/80 rounded-full transition"
              >
                <Icon name="settings" size={15} />
              </button>
            </>
          )}
        </div>

        <div onClick={onLogoClick} className="shrink-0 cursor-pointer py-1 px-2 rounded-xl active:scale-95 transition">
          <img src="/logo.png" alt="Futebol Cefas" className="h-14 w-auto drop-shadow-md" />
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5">
          {isAdmin && (
            <>
              <span className="min-w-0 bg-white/10 text-white/80 text-[11px] font-medium pl-2.5 pr-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                {isViewerRole ? <Icon name="eye" size={12} className="shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-fc-lime shrink-0" />}
                <span className="truncate">{getAdminLabel(admins, currentAdmin) || 'ADM'}</span>
              </span>
              <button
                onClick={onLeaveAdmin}
                title="Sair"
                className="w-7 h-7 shrink-0 flex items-center justify-center bg-white/10 hover:bg-white/15 text-white/70 rounded-full transition"
              >
                <Icon name="logout" size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
