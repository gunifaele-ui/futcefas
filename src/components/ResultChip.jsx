import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

const CONFIRM_TIMEOUT_MS = 2500;

export default function ResultChip({ icon, label, shortLabel, count, tone, canEdit, onAdd, onRemove, confirmAdd = false }) {
  const [armed, setArmed] = useState(null); // null | 'add' | 'remove'
  const armTimer = useRef(null);

  useEffect(() => () => clearTimeout(armTimer.current), []);

  if (!canEdit && count === 0) return null;

  const arm = (kind) => {
    clearTimeout(armTimer.current);
    setArmed(kind);
    armTimer.current = setTimeout(() => setArmed(null), CONFIRM_TIMEOUT_MS);
  };

  const disarm = () => {
    clearTimeout(armTimer.current);
    setArmed(null);
  };

  const handleAddClick = () => {
    if (!confirmAdd) {
      onAdd();
      return;
    }
    if (armed === 'add') {
      disarm();
      onAdd();
      return;
    }
    arm('add');
  };

  const handleRemoveClick = () => {
    if (armed === 'remove') {
      disarm();
      onRemove();
      return;
    }
    arm('remove');
  };

  const isArmedAdd = armed === 'add';
  const isArmedRemove = armed === 'remove';

  return (
    <button
      type="button"
      disabled={!canEdit}
      onClick={canEdit ? handleAddClick : undefined}
      title={canEdit ? (isArmedAdd ? 'Toque de novo para confirmar' : `Marcar ${label.toLowerCase()}`) : label}
      className={`flex items-center gap-1 rounded-full pl-1.5 pr-1.5 py-0.5 text-[10px] font-semibold border shrink-0 transition ${
        isArmedAdd ? 'border-fc-coral bg-fc-coral/10 text-fc-coraldark ring-2 ring-fc-coral/40' : tone
      } ${canEdit ? 'active:scale-95' : ''}`}
    >
      <Icon name={icon} size={10} />
      <span>{isArmedAdd ? 'Confirmar?' : shortLabel || label}</span>
      <span>{count}</span>
      {canEdit && count > 0 && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveClick();
          }}
          title={isArmedRemove ? 'Toque de novo para confirmar' : `Tirar ${label.toLowerCase()}`}
          className={`ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none transition ${
            isArmedRemove ? 'bg-fc-coral text-white ring-2 ring-fc-coral/40' : 'bg-black/10'
          }`}
        >
          <Icon name={isArmedRemove ? 'check' : 'minus'} size={7} strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
}
