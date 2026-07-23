import { useState } from 'react';
import { parseAttendanceText } from '../../utils/attendanceParser';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';

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
      <h3 className="text-[15px] font-semibold text-fc-dark mb-1 flex items-center gap-2">
        <Icon name="clipboard" size={16} className="text-fc-dark/60" /> Colar lista do WhatsApp
      </h3>
      <p className="text-[12px] text-fc-muted mb-4 leading-relaxed">
        Cole a lista com ✅ pra quem vai e ❌ pra quem não vai. Se tiver uma linha "Avulsos", os nomes depois dela viram avulsos automaticamente.
      </p>

      {!parsed && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder={'Chicon ✅\nMiguel ✅\nJoãozinho ❌\n\nAvulsos\nFulano ✅'}
            className="w-full bg-fc-cream border border-fc-line rounded-xl py-3 px-4 text-[13px] text-fc-dark placeholder:text-fc-muted focus:outline-none focus:border-fc-dark/30 focus:bg-white font-medium transition resize-none"
            autoFocus
          />
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-fc-cream hover:bg-fc-line text-fc-dark/70 font-medium py-3 rounded-xl text-[13px] transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!text.trim()}
              className="flex-1 bg-fc-dark hover:bg-fc-dark2 disabled:opacity-40 text-white font-medium py-3 rounded-xl text-[13px] transition"
            >
              Analisar
            </button>
          </div>
        </>
      )}

      {parsed && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-fc-limesoft rounded-xl py-2.5">
              <span className="block text-[18px] font-semibold text-fc-dark">{parsed.matched.length}</span>
              <span className="text-[11px] text-fc-dark/60">Reconhecidos</span>
            </div>
            <div className="bg-fc-cream border border-fc-line rounded-xl py-2.5">
              <span className="block text-[18px] font-semibold text-fc-coraldark">{parsed.avulsosToCreate.length}</span>
              <span className="text-[11px] text-fc-muted">Avulsos novos</span>
            </div>
          </div>

          {parsed.unmatched.length > 0 && (
            <div className="space-y-2">
              <span className="text-[12px] font-medium text-fc-coraldark block">
                {parsed.unmatched.length} nome(s) não reconhecido(s) — quem é?
              </span>
              {parsed.unmatched.map((u, idx) => (
                <div key={idx} className="bg-fc-cream border border-fc-line rounded-xl p-2.5">
                  <p className="text-[13px] font-medium text-fc-dark mb-1.5 break-words">"{u.name}"</p>
                  <select
                    className="w-full bg-white border border-fc-line rounded-lg py-2 px-2.5 text-[12px] font-medium text-fc-dark/80 focus:outline-none focus:border-fc-dark/30"
                    defaultValue=""
                    onChange={(e) => handleResolutionChange(idx, e.target.value)}
                  >
                    <option value="" disabled>
                      Selecione uma opção...
                    </option>
                    <option value="__avulso__">Criar como avulso novo</option>
                    <option value="__ignore__">Ignorar essa linha</option>
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
            <p className="text-[12px] text-fc-muted text-center py-4">Nenhuma linha reconhecida. Confira se usou ✅ ou ❌ nas linhas.</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setParsed(null)}
              className="flex-1 bg-fc-cream hover:bg-fc-line text-fc-dark/70 font-medium py-3 rounded-xl text-[13px] transition"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 bg-fc-dark hover:bg-fc-dark2 text-white font-medium py-3 rounded-xl text-[13px] transition"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
