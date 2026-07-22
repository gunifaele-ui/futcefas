import { useState } from 'react';
import { parseAttendanceText } from '../../utils/attendanceParser';
import BottomSheet from '../BottomSheet';

export default function ImportAttendanceModal({ players, onApply, onClose }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [resolutions, setResolutions] = useState({});

  const handleAnalyze = () => {
    setParsed(parseAttendanceText(text, players));
    setResolutions({});
  };

  const handleResolutionChange = (idx, value) => {
    if (value === '__avulso__') {
      setResolutions((r) => ({ ...r, [idx]: { action: 'avulso' } }));
    } else if (value === '__ignore__' || value === '') {
      setResolutions((r) => ({ ...r, [idx]: { action: 'ignore' } }));
    } else {
      setResolutions((r) => ({ ...r, [idx]: { action: 'match', playerId: value } }));
    }
  };

  const handleApply = () => {
    const matchedUpdates = parsed.matched.map((m) => ({ playerId: m.player.id, present: m.present }));
    const avulsosToAdd = [...parsed.avulsosToCreate];

    parsed.unmatched.forEach((u, idx) => {
      const resolution = resolutions[idx];
      if (!resolution || resolution.action === 'ignore') return;
      if (resolution.action === 'avulso') {
        avulsosToAdd.push({ nome: u.name, present: u.present });
      } else if (resolution.action === 'match' && resolution.playerId) {
        matchedUpdates.push({ playerId: resolution.playerId, present: u.present });
      }
    });

    onApply(matchedUpdates, avulsosToAdd);
  };

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="font-black text-sm text-fc-dark mb-1">📋 Colar Lista do WhatsApp</h3>
      <p className="text-[11px] text-slate-400 mb-3 font-bold">
        Cole a lista com ✅ pra quem vai e ❌ pra quem não vai. Se tiver uma linha "Avulsos", os nomes depois dela viram avulsos automaticamente.
      </p>

      {!parsed && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder={'Chicon ✅\nMiguel ✅\nJoãozinho ❌\n\nAvulsos\nFulano ✅'}
            className="w-full bg-fc-cream border border-slate-200 rounded-2xl py-3 px-4 text-xs text-fc-dark focus:outline-none focus:border-fc-dark focus:ring-2 focus:ring-fc-lime/40 font-bold transition resize-none"
            autoFocus
          />
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-full text-xs transition">
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!text.trim()}
              className="flex-1 bg-fc-lime hover:brightness-95 disabled:opacity-40 text-fc-dark font-black py-3 rounded-full text-xs transition shadow-sm"
            >
              Analisar
            </button>
          </div>
        </>
      )}

      {parsed && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-fc-limesoft/60 border border-fc-limesoft rounded-2xl py-2">
              <span className="block text-lg font-black text-fc-dark">{parsed.matched.length}</span>
              <span className="text-[9px] font-bold text-fc-dark/70 uppercase">Reconhecidos</span>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl py-2">
              <span className="block text-lg font-black text-fc-coraldark">{parsed.avulsosToCreate.length}</span>
              <span className="text-[9px] font-bold text-fc-coraldark uppercase">Avulsos novos</span>
            </div>
          </div>

          {parsed.unmatched.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-fc-coraldark tracking-wider block">
                ⚠️ {parsed.unmatched.length} nome(s) não reconhecido(s) — quem é?
              </span>
              {parsed.unmatched.map((u, idx) => (
                <div key={idx} className="bg-orange-50 border border-orange-100 rounded-2xl p-2.5">
                  <p className="text-xs font-black text-fc-dark mb-1.5 break-words">"{u.name}"</p>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-2.5 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-fc-dark"
                    defaultValue=""
                    onChange={(e) => handleResolutionChange(idx, e.target.value)}
                  >
                    <option value="" disabled>
                      Selecione uma opção...
                    </option>
                    <option value="__avulso__">➕ Criar como avulso novo</option>
                    <option value="__ignore__">🚫 Ignorar essa linha</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        É o(a) {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {parsed.matched.length === 0 && parsed.avulsosToCreate.length === 0 && parsed.unmatched.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-4">Nenhuma linha reconhecida. Confira se usou ✅ ou ❌ nas linhas.</p>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setParsed(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-full text-xs transition">
              Voltar
            </button>
            <button type="button" onClick={handleApply} className="flex-1 bg-fc-lime hover:brightness-95 text-fc-dark font-black py-3 rounded-full text-xs transition shadow-sm">
              Aplicar
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
