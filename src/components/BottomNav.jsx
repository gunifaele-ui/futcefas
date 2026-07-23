import Icon from './Icon';

const ALL_TABS = [
  { key: 'presenca', icon: 'list', label: 'Quem vai', adminOnly: true },
  { key: 'times', icon: 'shield', label: 'Times', adminOnly: false },
  { key: 'notas', icon: 'star', label: 'Notas', adminOnly: true },
  { key: 'estatisticas', icon: 'chart', label: 'Stats', adminOnly: false },
];

export default function BottomNav({ isAdmin, activeTab, onChangeTab }) {
  const tabs = ALL_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-fc-cream via-fc-cream/95 to-transparent pointer-events-none z-30" />
      <nav
        className="fixed bottom-3 left-3 right-3 max-w-md mx-auto bg-white/95 backdrop-blur border border-fc-line rounded-3xl shadow-nav flex justify-around items-center px-1.5 py-1.5 z-40"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChangeTab(tab.key)}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition ${active ? 'bg-fc-limesoft' : ''}`}
          >
            <Icon name={tab.icon} size={19} className={active ? 'text-fc-dark' : 'text-fc-muted'} strokeWidth={active ? 2 : 1.6} />
            <span className={`text-[10px] tracking-tight ${active ? 'text-fc-dark font-semibold' : 'text-fc-muted font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
      </nav>
    </>
  );
}
