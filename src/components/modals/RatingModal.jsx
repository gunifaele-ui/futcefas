import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

const ADMS = [
  { key: 'gustavo', label: 'Gustavo', color: '#4B7BA8' },
  { key: 'enzo', label: 'Enzo', color: '#7A6BA8' },
  { key: 'miguel', label: 'Miguel', color: '#A8874B' },
];

export default function RatingModal({ player, tempNotes, setTempNotes, currentAdmin, onSave, onClose }) {
  const media = ((tempNotes.gustavo + tempNotes.enzo + tempNotes.miguel) / 3).toFixed(2);

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
        {ADMS.map((adm) => {
          const isEditable = adm.key === currentAdmin;
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
                <span className="text-[13px] font-semibold text-fc-dark bg-fc-cream px-2.5 py-0.5 rounded-full min-w-[2.75rem] text-center">
                  {tempNotes[adm.key].toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                className="fc-range w-full disabled:cursor-not-allowed"
                style={{ color: adm.color }}
                min="1"
                max="10"
                step="0.5"
                value={tempNotes[adm.key]}
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
