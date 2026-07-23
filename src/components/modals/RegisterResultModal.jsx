import { useState } from 'react';
import BottomSheet from '../BottomSheet';

export default function RegisterResultModal({ teams, onSave, onClose }) {
  const [selectedWinners, setSelectedWinners] = useState([]);
  const [goalRows, setGoalRows] = useState([{ playerId: '', gols: 1 }]);

  const allPlayers = teams.flatMap((t) => t.players);
  const isTieAll = selectedWinners === 'all';

  const toggleTeam = (teamId) => {
    if (isTieAll) return;
    setSelectedWinners((prev) => (prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]));
  };

  const toggleTieAll = () => {
    setSelectedWinners((prev) => (prev === 'all' ? [] : 'all'));
  };

  const updateGoalRow = (idx, field, value) => {
    setGoalRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const addGoalRow = () => setGoalRows((rows) => [...rows, { playerId: '', gols: 1 }]);
  const removeGoalRow = (idx) => setGoalRows((rows) => rows.filter((_, i) => i !== idx));

  const canSave = isTieAll || selectedWinners.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(selectedWinners, goalRows);
  };

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="font-black text-sm text-fc-dark mb-1">📊 Registrar Resultado do Dia</h3>
      <p className="text-[11px] text-slate-400 mb-4 font-bold">Marque quem venceu e quem fez gol antes de resetar a chamada.</p>

      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-fc-dark block mb-2">Time(s) vencedor(es)</span>
          <div className="space-y-1.5">
            {teams.map((t) => (
              <label
                key={t.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                  selectedWinners.includes(t.id) ? 'bg-fc-limesoft/50 border-fc-limesoft' : 'bg-fc-cream border-slate-200'
                } ${isTieAll ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <input type="checkbox" checked={selectedWinners.includes(t.id)} onChange={() => toggleTeam(t.id)} className="accent-fc-dark" />
                <span className="text-xs font-black text-fc-dark">{t.name}</span>
              </label>
            ))}
            <label
              className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                isTieAll ? 'bg-fc-limesoft/50 border-fc-limesoft' : 'bg-fc-cream border-slate-200'
              }`}
            >
              <input type="checkbox" checked={isTieAll} onChange={toggleTieAll} className="accent-fc-dark" />
              <span className="text-xs font-black text-fc-dark">🤝 Empate geral (todos venceram)</span>
            </label>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-fc-dark block mb-2">⚽ Gols</span>
          <div className="space-y-1.5">
            {goalRows.map((row, idx) => (
              <div key={idx} className="flex gap-1.5 items-center">
                <select
                  value={row.playerId}
                  onChange={(e) => updateGoalRow(idx, 'playerId', e.target.value)}
                  className="flex-1 min-w-0 bg-fc-cream border border-slate-200 rounded-xl py-2 px-2 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-fc-dark"
                >
                  <option value="">Selecione o jogador...</option>
                  {allPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={row.gols}
                  onChange={(e) => updateGoalRow(idx, 'gols', parseInt(e.target.value, 10) || 1)}
                  className="w-14 bg-fc-cream border border-slate-200 rounded-xl py-2 px-2 text-[11px] font-bold text-center text-slate-700 focus:outline-none focus:border-fc-dark"
                />
                <button
                  type="button"
                  onClick={() => removeGoalRow(idx)}
                  className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs transition"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addGoalRow}
              className="w-full text-[11px] font-black text-fc-dark bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition"
            >
              + Adicionar goleador
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <button type="button" onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-3 rounded-full text-xs transition">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 bg-fc-lime hover:brightness-95 disabled:opacity-40 text-fc-dark font-black py-3 rounded-full text-xs transition shadow-sm"
        >
          Salvar Resultado
        </button>
      </div>
    </BottomSheet>
  );
}
