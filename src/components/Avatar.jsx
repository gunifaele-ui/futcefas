import { getInitials, getAvatarStyle } from '../utils/playerVisuals';

function BadgeOverlay({ badge }) {
  if (!badge) return null;
  return (
    <span
      title={badge.label}
      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-fc-surface ring-1 ring-fc-line flex items-center justify-center text-[8px] leading-none shrink-0"
    >
      {badge.icon}
    </span>
  );
}

export default function Avatar({ nome, foto, size = 'w-9 h-9', textSize = 'text-[11px]', badge = null }) {
  const style = getAvatarStyle(nome);

  if (foto) {
    return (
      <div className="relative shrink-0">
        <div className={`${size} rounded-full overflow-hidden ring-1 ${style.ring} shrink-0`}>
          <img src={foto} alt={nome} className="w-full h-full object-cover" />
        </div>
        <BadgeOverlay badge={badge} />
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <div className={`${size} rounded-full ${style.bg} ring-1 ${style.ring} flex items-center justify-center text-fc-ink/70 ${textSize} font-semibold shrink-0`}>
        {getInitials(nome)}
      </div>
      <BadgeOverlay badge={badge} />
    </div>
  );
}
