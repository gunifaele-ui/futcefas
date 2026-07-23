import { useState } from 'react';
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

export default function ActivityLogModal({ activityLog, admins, onClose }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const visibleEntries = activityLog.slice(0, visibleCount);

  return (
    <BottomSheet onClose={onClose}>
      <h3 className="text-[15px] font-semibold text-fc-dark mb-3.5 flex items-center gap-2">
        <Icon name="bell" size={16} className="text-fc-dark/70" /> Notificações
      </h3>

      {activityLog.length === 0 ? (
        <p className="text-[12px] text-fc-muted text-center py-6">Nenhuma ação nas últimas 12h.</p>
      ) : (
        <div className="space-y-2">
          {visibleEntries.map((entry) => (
            <div key={entry.id} className="border border-fc-line rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-medium text-fc-dark leading-snug">
                  <span className="text-fc-dark/60">{getAdminLabel(admins, entry.adminKey) || 'Alguém'}</span> {entry.message}
                </p>
              </div>
              <p className="text-[10px] text-fc-muted mt-1">{formatWhen(entry.timestamp)}</p>
            </div>
          ))}

          {visibleCount < activityLog.length && (
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
