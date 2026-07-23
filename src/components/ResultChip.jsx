import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

const CONFIRM_TIMEOUT_MS = 2500;

export default function ResultChip({ icon, label, shortLabel, count, tone, canEdit, onAdd, onRemove, confirmAdd = false }) {
  const [armed, setArmed] = useState(false);
  const armTimer = useRef(null);

  useEffect(() => () => clearTimeout(armTimer.current), []);

  if (!canEdit && count === 0) return null;

  const handleAddClick = () => {
    if (!confirmAdd) {
      onAdd();
      return;
    }
    if (armed) {
      clearTimeout(armTimer.current);
      setArmed(false);
      onAdd();
      return;
    }
    setArmed(true);
    armTimer.current = setTimeout(() => setArmed(false), CONFIRM_TIMEOUT_MS);
  };

  return (
    <button
      type="button"
      disabled={!canEdit}
      onClick={canEdit ? handleAddClick : undefined}
      title={canEdit ? (armed ? 'Toque de novo para confirmar' : `Marcar ${label.toLowerCase()}`) : label}
      className={`flex items-center gap-1 rounded-full pl-1.5 pr-1.5 py-0.5 text-[10px] font-semibold border shrink-0 transition ${
        armed ? 'border-fc-coral bg-fc-coral/10 text-fc-coraldark ring-2 ring-fc-coral/40' : tone
      } ${canEdit ? 'active:scale-95' : ''}`}
    >
      <Icon name={icon} size={10} />
      <span>{armed ? 'Confirmar?' : shortLabel || label}</span>
      <span>{count}</span>
      {canEdit && count > 0 && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            clearTimeout(armTimer.current);
            setArmed(false);
            onRemove();
          }}
          title={`Tirar ${label.toLowerCase()}`}
          className="ml-0.5 w-3.5 h-3.5 rounded-full bg-black/10 flex items-center justify-center leading-none"
        >
          <Icon name="minus" size={7} strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
}
