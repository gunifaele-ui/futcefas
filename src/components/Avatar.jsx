import { getInitials, getAvatarStyle } from '../utils/playerVisuals';

export default function Avatar({ nome, foto, size = 'w-9 h-9', textSize = 'text-[11px]' }) {
  const style = getAvatarStyle(nome);

  if (foto) {
    return (
      <div className={`${size} rounded-full overflow-hidden ring-1 ${style.ring} shrink-0`}>
        <img src={foto} alt={nome} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${size} rounded-full ${style.bg} ring-1 ${style.ring} flex items-center justify-center text-fc-dark/70 ${textSize} font-semibold shrink-0`}>
      {getInitials(nome)}
    </div>
  );
}
