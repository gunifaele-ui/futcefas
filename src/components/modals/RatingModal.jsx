import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

const ADM_COLORS = ['#4B7BA8', '#7A6BA8', '#A8874B', '#3F8F5F', '#B0555F', '#5F8FB0'];

export default function RatingModal({ player, admins, tempNotes, setTempNotes, currentAdmin, onSave, onClose }) {
  const definedRatings = admins.map((a) => tempNotes[a.key]).filter((v) => v != null);
  const media = definedRatings.length
    ? (definedRatings.reduce((sum, v) => sum + v, 0) / definedRatings.length).toFixed(2)
    : '—';

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center gap-2.5 mb-1">
        <Avatar nome={player.nome} foto={player.foto} size="w-9 h-9" />
        <h3 className="text-[15px] font-semibold text-fc-dark">Mudar nota de {player.nome}</h3>
      </div>
      <p className="text-[12px] text-fc-muted mb-4 leading-relaxed">
        Arraste pra ajustar sua nota (1.0 a 10.0). Só dá pra mudar a nota do ADM logado.
      </p>

      <div className="space-y-3">
        {admins.map((adm, idx) => {
          const isEditable = adm.key === currentAdmin;
          const value = tempNotes[adm.key];
          const hasValue = value != null;
          const color = ADM_COLORS[idx % ADM_COLORS.length];

          return (
            <div
              key={adm.key}
              className={`p-3 rounded-xl border ${isEditable ? 'border-fc-line bg-white' : 'border-fc-line bg-fc-cream/60 opacity-60'}`}
            >
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[12px] font-medium text-fc-dark/70 flex items-center gap-1.5">
                  {adm.label}
                  {!isEditable && <Icon name="lock" size={11} />}
                </span>
                <div className="flex items-center gap-1.5">
                  {hasValue ? (
                    <span className="text-[13px] font-semibold text-fc-dark bg-fc-cream px-2.5 py-0.5 rounded-full min-w-[2.75rem] text-center">
                      {value.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-fc-muted bg-fc-cream px-2.5 py-0.5 rounded-full">
                      Sem nota
                    </span>
                  )}
                  {isEditable && hasValue && (
                    <button
                      type="button"
                      onClick={() => setTempNotes({ ...tempNotes, [adm.key]: null })}
                      title="Tirar minha nota (não conta na média)"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-fc-muted hover:text-fc-coraldark hover:bg-orange-50 transition"
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                className="fc-range w-full disabled:cursor-not-allowed"
                style={{ color }}
                min="1"
                max="10"
                step="0.5"
                value={value ?? 7}
                disabled={!isEditable}
                onChange={(e) => setTempNotes({ ...tempNotes, [adm.key]: parseFloat(e.target.value) })}
              />
            </div>
          );
        })}

        <div className="flex justify-between items-center border-t border-fc-line pt-3">
          <span className="text-[12px] text-fc-muted">Média calculada</span>
          <span className="text-[14px] font-semibold text-fc-dark bg-fc-limesoft px-3 py-1 rounded-full">{media}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-fc-cream hover:bg-fc-line text-fc-dark/70 font-medium py-3 rounded-xl text-[13px] transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex-1 bg-fc-dark hover:bg-fc-dark2 text-white font-medium py-3 rounded-xl text-[13px] transition"
        >
          Salvar
        </button>
      </div>
    </BottomSheet>
  );
}
