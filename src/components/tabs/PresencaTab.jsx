import { useRef } from 'react';
import Avatar from '../Avatar';
import Icon from '../Icon';

const TRIPLE_CLICK_WINDOW_MS = 650;

function SelectAllButton({ allSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-fc-line bg-white hover:bg-fc-cream text-fc-dark/70 active:scale-95 transition shrink-0"
    >
      {allSelected ? 'Desmarcar todos' : 'Marcar todos'}
    </button>
  );
}

function PlayerChip({ p, palette, onDragStart, onToggle, onToggleTipo, badgeColor, subLabel, subLabelColor, isViewer }) {
  const clickTrack = useRef({ count: 0, lastClick: 0 });

  const handleClick = () => {
    if (isViewer) return;
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
      draggable={!isViewer}
      onDragStart={(e) => onDragStart(e, p)}
      onClick={handleClick}
      className={`p-2 rounded-xl text-center transition relative border flex flex-col items-center gap-1 min-w-0 ${isViewer ? '' : 'cursor-pointer'} ${
        p.statusPresenca ? palette.active : palette.inactive
      }`}
    >
      {p.statusPresenca && (
        <span className={`absolute -top-1.5 -right-1.5 w-4 h-4 ${badgeColor} rounded-full flex items-center justify-center text-white ring-2 ring-white`}>
          <Icon name="check" size={9} strokeWidth={3} />
        </span>
      )}
      <Avatar nome={p.nome} foto={p.foto} size="w-8 h-8" textSize="text-[9px]" />
      <span className="text-[11px] leading-tight font-medium break-words hyphens-auto block w-full mt-0.5">{p.nome}</span>
      <span className={`text-[9px] font-normal block ${subLabelColor}`}>{subLabel}</span>
    </div>
  );
}

export default function PresencaTab({
  players,
  isViewer,
  linePlayersList,
  goalkeepersList,
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
  const linePresentCount = linePlayersList.filter((p) => p.statusPresenca).length;
  const goalkeeperPresentCount = goalkeepersList.filter((p) => p.statusPresenca).length;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-4 border border-fc-line shadow-card">
        <div className="flex justify-between items-center mb-1 gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-fc-dark tracking-tight">Lista de quem vai</h2>
            <p className="text-[11px] text-fc-muted mt-0.5">
              {isViewer ? 'Modo visualização — sem edição.' : 'Só clicar no nome pra colocar a presença.'}
            </p>
          </div>

          {!isViewer && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenSearch}
                title="Buscar jogador"
                className="w-8 h-8 rounded-lg bg-fc-cream hover:bg-fc-line text-fc-dark/70 flex items-center justify-center active:scale-95 transition"
              >
                <Icon name="search" size={15} />
              </button>

              <button
                onClick={onOpenImport}
                title="Colar lista do WhatsApp"
                className="w-8 h-8 rounded-lg bg-fc-cream hover:bg-fc-line text-fc-dark/70 flex items-center justify-center active:scale-95 transition"
              >
                <Icon name="clipboard" size={15} />
              </button>

              <button
                onClick={onOpenAddAvulso}
                className="bg-fc-dark hover:bg-fc-dark2 text-white text-[12px] font-medium pl-2.5 pr-3 py-2 rounded-xl active:scale-95 transition flex items-center gap-1"
              >
                <Icon name="plus" size={14} /> Avulso
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 bg-fc-limesoft rounded-xl px-3 py-2.5 flex justify-between items-center gap-2">
          <span className="text-[13px] font-semibold text-fc-dark">
            {linePresentCount} {linePresentCount === 1 ? 'pessoa vai' : 'pessoas vão'} hoje
            {goalkeeperPresentCount > 0 && ` + ${goalkeeperPresentCount} ${goalkeeperPresentCount === 1 ? 'goleiro' : 'goleiros'}`}
          </span>
          {!isViewer && <span className="text-[11px] text-fc-dark/60">Arraste entre as listas para trocar posição</span>}
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'Goleiro')}
        className="bg-white border border-fc-line rounded-2xl p-3.5 shadow-card"
      >
        <div className="flex items-center justify-between mb-2.5 gap-2">
          <span className="text-[12px] font-medium text-fc-dark/70 flex items-center gap-1.5">
            <Icon name="gloves" size={14} /> Goleiros ({goalkeepersList.filter((p) => p.statusPresenca).length} presentes)
          </span>
          {!isViewer && <SelectAllButton allSelected={allGoalkeepersPresent} onClick={onToggleAllGoalkeepers} />}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {goalkeepersList.map((p) => (
            <PlayerChip
              key={p.id}
              p={p}
              isViewer={isViewer}
              onDragStart={onDragStart}
              onToggle={onTogglePresence}
              onToggleTipo={onToggleTipo}
              badgeColor="bg-fc-coral"
              subLabel="GK"
              subLabelColor="text-fc-muted"
              palette={{
                active: 'bg-orange-50/60 border-fc-coral/30 text-fc-dark',
                inactive: 'bg-white border-fc-line text-fc-muted',
              }}
            />
          ))}
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, 'Linha')}
        className="bg-white border border-fc-line rounded-2xl p-3.5 shadow-card"
      >
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-[12px] font-medium text-fc-dark/70 flex items-center gap-1.5">
            <Icon name="run" size={14} /> Jogadores de linha ({linePlayersList.filter((p) => p.statusPresenca).length} presentes)
          </span>
          {!isViewer && <SelectAllButton allSelected={allLinePresent} onClick={onToggleAllLine} />}
        </div>
        <p className="text-[11px] text-fc-muted mb-2.5">{requiredCount} necessários pro sorteio</p>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {linePlayersList
            .filter((p) => p.tipo === 'Mensalista')
            .map((p) => (
              <PlayerChip
                key={p.id}
                p={p}
                isViewer={isViewer}
                onDragStart={onDragStart}
                onToggle={onTogglePresence}
                onToggleTipo={onToggleTipo}
                badgeColor="bg-fc-dark"
                subLabel="Mensal"
                subLabelColor="text-fc-muted"
                palette={{
                  active: 'bg-fc-limesoft border-fc-lime/40 text-fc-dark',
                  inactive: 'bg-white border-fc-line text-fc-muted',
                }}
              />
            ))}
        </div>

        {linePlayersList.some((p) => p.tipo === 'Avulso') && (
          <div className="mt-3 border-t border-fc-line pt-3">
            <span className="text-[11px] font-medium text-fc-muted block mb-2">Avulsos</span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {linePlayersList
                .filter((p) => p.tipo === 'Avulso')
                .map((p) => (
                  <PlayerChip
                    key={p.id}
                    p={p}
                    isViewer={isViewer}
                    onDragStart={onDragStart}
                    onToggle={onTogglePresence}
                    onToggleTipo={onToggleTipo}
                    badgeColor="bg-fc-dark"
                    subLabel="Avulso"
                    subLabelColor="text-fc-muted"
                    palette={{
                      active: 'bg-fc-limesoft border-fc-lime/40 text-fc-dark',
                      inactive: 'bg-white border-fc-line text-fc-muted',
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {!isViewer && (
        <div className="pt-1">
          <button
            onClick={onDraftTeams}
            className="w-full bg-fc-dark hover:bg-fc-dark2 text-white font-medium py-3.5 rounded-xl active:scale-[0.99] transition text-[14px] flex items-center justify-center gap-2"
          >
            <Icon name="ball" size={17} /> Tirar time
          </button>
        </div>
      )}
    </div>
  );
}
