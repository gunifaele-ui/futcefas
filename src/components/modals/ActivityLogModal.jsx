import { useMemo, useState } from 'react';
import BottomSheet from '../BottomSheet';
import Icon from '../Icon';
import { getAdminLabel } from '../../utils/adminLabels';

const INITIAL_COUNT = 10;
const PAGE_SIZE = 10;

function formatWhen(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `Hoje, ${time}`;
  return `${date.toLocaleDateString('pt-BR')}, ${time}`;
}

function joinNames(names) {
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}

// Junta várias avaliações da mesma pessoa (por ADMs diferentes) em uma notificação só,
// pra não lotar a lista quando todo mundo dá nota no mesmo jogador em sequência.
function compileActivityLog(entries, admins) {
  const groups = new Map();
  const passthrough = [];

  entries.forEach((entry) => {
    if (entry.type === 'rating' && entry.targetNome) {
      if (!groups.has(entry.targetNome)) groups.set(entry.targetNome, []);
      groups.get(entry.targetNome).push(entry);
    } else {
      passthrough.push(entry);
    }
  });

  const compiled = [];
  groups.forEach((groupEntries, targetNome) => {
    const latest = groupEntries.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
    const uniqueAdminKeys = [...new Set(groupEntries.map((e) => e.adminKey))];
    if (uniqueAdminKeys.length <= 1) {
      compiled.push(latest);
    } else {
      const names = uniqueAdminKeys.map((k) => getAdminLabel(admins, k) || 'Alguém');
      compiled.push({
        id: `rating-group-${targetNome}`,
        timestamp: latest.timestamp,
        compiledMessage: `${joinNames(names)} mudaram a nota de ${targetNome}`,
      });
    }
  });

  return [...passthrough, ...compiled].sort((a, b) => b.timestamp - a.timestamp);
}

export default function ActivityLogModal({ activityLog, admins, onClose }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const compiledLog = useMemo(() => compileActivityLog(activityLog, admins), [activityLog, admins]);
  const visibleEntries = compiledLog.slice(0, visibleCount);

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-fc-dark mb-3.5 flex items-center gap-2">
        <Icon name="bell" size={16} className="text-fc-dark/70" /> Notificações
      </h3>

      {compiledLog.length === 0 ? (
        <p className="text-[12px] text-fc-muted text-center py-6">Nenhuma ação nas últimas 12h.</p>
      ) : (
        <div className="space-y-2">
          {visibleEntries.map((entry) => (
            <div key={entry.id} className="border border-fc-line rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-medium text-fc-dark leading-snug">
                  {entry.compiledMessage ? (
                    entry.compiledMessage
                  ) : (
                    <>
                      <span className="text-fc-dark/60">{getAdminLabel(admins, entry.adminKey) || 'Alguém'}</span> {entry.message}
                    </>
                  )}
                </p>
              </div>
              <p className="text-[10px] text-fc-muted mt-1">{formatWhen(entry.timestamp)}</p>
            </div>
          ))}

          {visibleCount < compiledLog.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="w-full text-[12px] font-medium text-fc-dark/70 bg-fc-cream hover:bg-fc-line py-2.5 rounded-xl transition"
            >
              Ver mais
            </button>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
