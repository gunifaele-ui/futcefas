import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

export default function ConfirmActionModal({ title, message, confirmLabel = 'Confirmar', icon = 'lock', onConfirm, onClose }) {
  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-fc-ink mb-1 flex items-center gap-2">
        <Icon name={icon} size={16} className="text-fc-ink/70" /> {title}
      </h3>
      <p className="text-[12px] text-fc-muted mb-4 leading-relaxed">{message}</p>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-fc-cream hover:bg-fc-line text-fc-ink/70 font-medium py-3 rounded-xl text-[13px] transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 bg-fc-dark hover:bg-fc-dark2 text-white font-medium py-3 rounded-xl text-[13px] transition"
        >
          {confirmLabel}
        </button>
      </div>
    </BottomSheet>
  );
}
