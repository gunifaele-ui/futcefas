const ADMIN_LABELS = { gustavo: 'Gustavo', miguel: 'Miguel', enzo: 'Enzo', visualizar: '👁️ Visualizando' };

export default function Header({ isAdmin, currentAdmin, onLogoClick, onLeaveAdmin }) {
  return (
    <header className="sticky top-0 bg-fc-dark text-white pt-3.5 pb-7 px-3.5 flex flex-col items-center justify-between z-40 shadow-lg overflow-hidden rounded-b-[32px]">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-fc-lime/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center justify-center w-full max-w-md relative">
        <div onClick={onLogoClick} className="cursor-pointer py-1 px-2 rounded-xl active:scale-95 transition">
          <img src="/logo.png" alt="Futebol Cefas" className="h-14 w-auto drop-shadow-md" />
        </div>

        {isAdmin && (
          <div className="absolute right-0 flex items-center gap-2">
            <span className="bg-white/10 text-fc-limesoft text-[10px] font-black px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-fc-lime animate-pulse" /> {ADMIN_LABELS[currentAdmin] || 'ADM'}
            </span>
            <button
              onClick={onLeaveAdmin}
              className="bg-fc-coral/20 hover:bg-fc-coral/30 text-fc-coral text-[10px] font-black px-2 py-1 rounded-full border border-fc-coral/30 active:scale-95 transition"
            >
              🚪 Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
