const ALL_TABS = [
  { key: 'presenca', icon: '📋', label: 'Quem vai', adminOnly: true },
  { key: 'times', icon: '🛡️', label: 'Times', adminOnly: false },
  { key: 'notas', icon: '⭐', label: 'Notas', adminOnly: true },
];

export default function BottomNav({ isAdmin, activeTab, onChangeTab }) {
  const tabs = ALL_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <nav
      className="fixed bottom-3 left-3 right-3 max-w-md mx-auto bg-white rounded-full shadow-[0_8px_28px_-6px_rgba(23,52,48,0.3)] flex justify-around items-center px-2 py-2 z-40"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button key={tab.key} onClick={() => onChangeTab(tab.key)} className="flex flex-col items-center gap-0.5 py-1 px-3 transition">
            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition ${active ? 'bg-fc-limesoft' : ''}`}>
              {tab.icon}
            </span>
            <span className={`text-[9px] uppercase tracking-wider ${active ? 'text-fc-dark font-black' : 'text-slate-400 font-bold'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
