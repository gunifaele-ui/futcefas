import { useRef } from 'react';
import Avatar from '../Avatar';

const TRIPLE_CLICK_WINDOW_MS = 650;

function SelectAllButton({ allSelected, onClick, tone }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[9px] font-black px-2 py-1 rounded-full border active:scale-95 transition shrink-0 ${tone}`}
    >
      {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
    </button>
  );
}

function PlayerChip({ p, palette, onDragStart, onToggle, onToggleTipo, badgeColor, subLabel, subLabelColor }) {
  const clickTrack = useRef({ count: 0, lastClick: 0 });

  const handleClick = () => {
    onToggle(p.id);

    const now = Date.now();
    const track = clickTrack.current;
    track.count = now - track.lastClick < TRIPLE_CLICK_WINDOW_MS ? track.count + 1 : 1;
    track.lastClick = now;

    if (track.count === 3) {
      track.count = 0;
      onToggleTipo(p.id);
    }
  };

  return (
    <div
      key={p.id}
      draggable
      onDragStart={(e) => onDragStart(e, p)}
      onClick={handleClick}
      className={`p-2 rounded-2xl text-center cursor-pointer transition relative border flex flex-col items-center gap-1 min-w-0 ${
        p.statusPresenca ? palette.active : palette.inactive
      }`}
    >
      {p.statusPresenca && (
        <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 ${badgeColor} rounded-full flex items-center justify-center text-white text-[8px] font-black shadow-sm ring-2 ring-white`}>✓</span>
      )}
      <Avatar nome={p.nome} size="w-8 h-8" textSize="text-[9px]" />
      <span className="text-[10px] leading-tight font-black break-words hyphens-auto block w-full mt-0.5">{p.nome}</span>
      <span className={`text-[7px] font-extrabold uppercase block ${subLabelColor}`}>{subLabel}</span>
    </div>
  );
}

export default function PresencaTab({
  players,
  linePlayersList,
  goalkeepersList,
  presentCount,
  requiredCount,
  onTogglePresence,
  onToggleTipo,
  onDragStart,
  onDragOver,
  onDrop,
  allLinePresent,
  allGoalkeepersPresent,
  onToggleAllLine,
  onToggleAllGoalkeepers,
  onOpenSearch,
  onOpenAddAvulso,
  onOpenImport,
  onDraftTeams,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h2 className="text-base font-black text-fc-dark tracking-tight">Lista de quem vai</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Só clicar no nome pra colocar a presença.</p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSearch}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs active:scale-95 transition shadow-sm"
            >
              🔍
            </button>

            <button
              onClick={onOpenImport}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs active:scale-95 transition shadow-sm"
            >
              📋
            </button>

            <button
              onClick={onOpenAddAvulso}
              className="bg-fc-coral hover:bg-fc-coraldark text-white text-[10px] font-black px-3 py-2 rounded-full active:scale-95 transition shadow-sm"
            >
              + Avulso
            </button>
          </div>
        </div>

        <div className="mt-2.5 bg-fc-limesoft/50 rounded-2xl p-2.5 border border-fc-limesoft flex justify-between items-center text-xs">
          <span className="font-extrabold text-fc-dark">{presentCount} vão hoje</span>
          <span className="text-[10px] text-fc-dark/70 font-bold">Arraste entre as listas para alterar posição</span>
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'Goleiro')}
        className="bg-orange-500/5 border-2 border-dashed border-orange-200 rounded-3xl p-3"
      >
        <div className="flex items-center justify-between mb-2 px-1 gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-fc-coraldark flex items-center gap-1">
            <span>🧤</span> Goleiros ({goalkeepersList.filter((p) => p.statusPresenca).length} presentes)
          </span>
          <SelectAllButton
            allSelected={allGoalkeepersPresent}
            onClick={onToggleAllGoalkeepers}
            tone="bg-orange-50 border-orange-200 text-fc-coraldark"
          />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {goalkeepersList.map((p) => (
            <PlayerChip
              key={p.id}
              p={p}
              onDragStart={onDragStart}
              onToggle={onTogglePresence}
              onToggleTipo={onToggleTipo}
              badgeColor="bg-fc-coral"
              subLabel="GK"
              subLabelColor="text-fc-coraldark"
              palette={{
                active: 'bg-orange-50 border-fc-coral/40 text-fc-dark shadow-sm',
                inactive: 'bg-white/60 border-slate-200 text-slate-400 opacity-60',
              }}
            />
          ))}
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'Linha')}
        className="bg-fc-limesoft/20 border-2 border-dashed border-fc-limesoft rounded-3xl p-3"
      >
        <div className="flex items-center justify-between mb-2 px-1 gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-fc-dark flex items-center gap-1">
            <span>🏃</span> Jogadores de Linha ({linePlayersList.filter((p) => p.statusPresenca).length} presentes)
          </span>
          <SelectAllButton
            allSelected={allLinePresent}
            onClick={onToggleAllLine}
            tone="bg-fc-limesoft/50 border-fc-limesoft text-fc-dark"
          />
        </div>
        <p className="text-[9px] text-fc-dark/60 font-bold px-1 mb-2">{requiredCount} necessários pro sorteio</p>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {linePlayersList
            .filter((p) => p.tipo === 'Mensalista')
            .map((p) => (
              <PlayerChip
                key={p.id}
                p={p}
                onDragStart={onDragStart}
                onToggle={onTogglePresence}
                onToggleTipo={onToggleTipo}
                badgeColor="bg-fc-dark"
                subLabel="Mensal"
                subLabelColor="text-fc-dark/70"
                palette={{
                  active: 'bg-white border-fc-limesoft text-fc-dark shadow-sm',
                  inactive: 'bg-slate-100 border-slate-200 text-slate-400 opacity-60',
                }}
              />
            ))}
        </div>

        {linePlayersList.some((p) => p.tipo === 'Avulso') && (
          <div className="my-3 border-t border-fc-limesoft/60 pt-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Avulsos</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {linePlayersList
                .filter((p) => p.tipo === 'Avulso')
                .map((p) => (
                  <PlayerChip
                    key={p.id}
                    p={p}
                    onDragStart={onDragStart}
                    onToggle={onTogglePresence}
                    onToggleTipo={onToggleTipo}
                    badgeColor="bg-fc-dark"
                    subLabel="Avulso"
                    subLabelColor="text-fc-dark/70"
                    palette={{
                      active: 'bg-fc-limesoft/40 border-fc-limesoft text-fc-dark shadow-sm',
                      inactive: 'bg-slate-100 border-slate-200 text-slate-400 opacity-60',
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          onClick={onDraftTeams}
          className="w-full bg-fc-lime hover:brightness-95 text-fc-dark font-black py-4 rounded-full shadow-md active:scale-95 transition text-xs uppercase tracking-wider"
        >
          ⚽ Tirar time
        </button>
      </div>
    </div>
  );
}
