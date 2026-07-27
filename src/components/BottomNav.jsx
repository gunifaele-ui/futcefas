import Icon from './Icon';
import { NAV_TABS } from '../utils/navTabs';

export default function BottomNav({ isAdmin, activeTab, onChangeTab }) {
  const tabs = NAV_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-fc-cream via-fc-cream/95 to-transparent pointer-events-none z-30" />
      <nav
        className="md:hidden fixed bottom-3 left-3 right-3 max-w-md mx-auto bg-fc-surface/95 backdrop-blur border border-fc-line rounded-3xl shadow-nav flex justify-around items-center px-1.5 py-1.5 z-40"
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
            <Icon name={tab.icon} size={19} className={active ? 'text-fc-ink' : 'text-fc-muted'} strokeWidth={active ? 2 : 1.6} />
            <span className={`text-[10px] tracking-tight ${active ? 'text-fc-ink font-semibold' : 'text-fc-muted font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
      </nav>
    </>
  );
}
