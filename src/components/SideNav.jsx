import Icon from './Icon';
import { NAV_TABS } from '../utils/navTabs';

export default function SideNav({ isAdmin, activeTab, onChangeTab }) {
  const tabs = NAV_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <nav className="hidden md:flex flex-col gap-1.5 w-52 shrink-0 sticky top-24 self-start">
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChangeTab(tab.key)}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition text-left ${
              active ? 'bg-fc-surface border border-fc-line shadow-card' : 'hover:bg-fc-surface/60'
            }`}
          >
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${active ? 'bg-fc-limesoft text-fc-ink' : 'bg-fc-surface text-fc-muted'}`}>
              <Icon name={tab.icon} size={22} strokeWidth={active ? 2 : 1.6} />
            </span>
            <span className={`text-[14px] tracking-tight ${active ? 'text-fc-ink font-semibold' : 'text-fc-muted font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
