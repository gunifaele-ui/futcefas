import Avatar from '../Avatar';
import BottomSheet from '../BottomSheet';

const ADMS = [
  { key: 'gustavo', label: 'Gustavo', color: '#0284c7', text: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
  { key: 'enzo', label: 'Enzo', color: '#7c3aed', text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  { key: 'miguel', label: 'Miguel', color: '#d97706', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
];

export default function RatingModal({ player, tempNotes, setTempNotes, currentAdmin, onSave, onClose }) {
  const media = ((tempNotes.gustavo + tempNotes.enzo + tempNotes.miguel) / 3).toFixed(2);

  return (
    <BottomSheet onClose={onClose}>
      <div className="flex items-center gap-2.5 mb-1">
        <Avatar nome={player.nome} foto={player.foto} size="w-9 h-9" />
        <h3 className="font-black text-sm text-fc-dark">Mudar nota de {player.nome}</h3>
      </div>
      <p className="text-[11px] text-slate-400 mb-4 font-bold">Arraste pra ajustar sua nota (1.0 a 10.0). Só dá pra mudar a nota do ADM logado.</p>

      <div className="space-y-4">
        {ADMS.map((adm) => {
          const isEditable = adm.key === currentAdmin;
          return (
            <div key={adm.key} className={`p-3 rounded-2xl border ${adm.bg} ${adm.border} ${!isEditable ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-black ${adm.text}`}>
                  {adm.label}
                  {!isEditable && ' 🔒'}
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full bg-white ${adm.text} shadow-sm min-w-[2.5rem] text-center`}>
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

        <div className="pt-1 flex justify-between items-center text-xs border-t border-slate-100 pt-3 font-black">
          <span className="text-slate-500">Média Calculada:</span>
          <span className="text-fc-dark bg-fc-limesoft px-3 py-1.5 rounded-full text-sm">{media}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-full text-xs transition"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex-1 bg-fc-lime hover:brightness-95 text-fc-dark font-black py-3 rounded-full text-xs transition shadow-sm"
        >
          Salvar
        </button>
      </div>
    </BottomSheet>
  );
}
