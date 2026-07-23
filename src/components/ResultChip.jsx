import Icon from './Icon';

export default function ResultChip({ icon, label, shortLabel, count, tone, canEdit, onAdd, onRemove }) {
  if (!canEdit && count === 0) return null;

  return (
    <button
      type="button"
      disabled={!canEdit}
      onClick={canEdit ? onAdd : undefined}
      title={canEdit ? `Marcar ${label.toLowerCase()}` : label}
      className={`flex items-center gap-1 rounded-full pl-1.5 pr-1.5 py-0.5 text-[10px] font-semibold border shrink-0 transition ${tone} ${
        canEdit ? 'active:scale-95' : ''
      }`}
    >
      <Icon name={icon} size={10} />
      <span>{shortLabel || label}</span>
      <span>{count}</span>
      {canEdit && count > 0 && (
        <span
          onClick={(e) => {
            e.stopPropagation();
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
