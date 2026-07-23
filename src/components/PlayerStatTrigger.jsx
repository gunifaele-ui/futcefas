import { useRef, useState } from 'react';
import Icon from './Icon';

const CLICK_DELAY_MS = 250;

function StatMenu({ options, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onTouchStart={onClose} />
      <div className="absolute z-50 top-full mt-1.5 left-1/2 -translate-x-1/2 bg-fc-dark rounded-xl shadow-lg p-1 flex gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              opt.onSelect();
              onClose();
            }}
            className="flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg hover:bg-white/10 active:bg-white/10 text-white transition whitespace-nowrap"
          >
            <Icon name={opt.icon} size={15} />
            <span className="text-[9px] font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default function PlayerStatTrigger({
  canEdit,
  gols = 0,
  assistencias = 0,
  onAddGoal,
  onAddAssist,
  onRemoveGoal,
  onRemoveAssist,
  className,
  children,
}) {
  const [menu, setMenu] = useState(null); // null | 'add' | 'remove'
  const clickTimer = useRef(null);
  const hasStat = gols > 0 || assistencias > 0;

  const clearClickTimer = () => {
    clearTimeout(clickTimer.current);
    clickTimer.current = null;
  };

  const handleClick = () => {
    if (!canEdit) return;
    clearClickTimer();
    clickTimer.current = setTimeout(() => {
      setMenu('add');
      clickTimer.current = null;
    }, CLICK_DELAY_MS);
  };

  const handleDoubleClick = () => {
    clearClickTimer();
    if (!canEdit || !hasStat) return;
    if (gols > 0 && assistencias > 0) {
      setMenu('remove');
    } else if (gols > 0) {
      onRemoveGoal();
    } else {
      onRemoveAssist();
    }
  };

  const addOptions = [
    { key: 'gol', icon: 'ball', label: 'Gol', onSelect: onAddGoal },
    { key: 'assist', icon: 'assist', label: 'Assist.', onSelect: onAddAssist },
  ];
  const removeOptions = [
    gols > 0 && { key: 'gol', icon: 'ball', label: 'Tirar gol', onSelect: onRemoveGoal },
    assistencias > 0 && { key: 'assist', icon: 'assist', label: 'Tirar assist.', onSelect: onRemoveAssist },
  ].filter(Boolean);

  return (
    <div className={`relative ${className || 'inline-flex'}`}>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => canEdit && e.preventDefault()}
        style={{ touchAction: 'manipulation' }}
        className={canEdit ? 'cursor-pointer select-none' : 'select-none'}
      >
        {children}
      </div>
      {menu === 'add' && <StatMenu options={addOptions} onClose={() => setMenu(null)} />}
      {menu === 'remove' && <StatMenu options={removeOptions} onClose={() => setMenu(null)} />}
    </div>
  );
}
