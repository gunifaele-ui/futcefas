import { getInitials, getAvatarStyle } from '../utils/playerVisuals';

export default function Avatar({ nome, foto, size = 'w-9 h-9', textSize = 'text-[11px]' }) {
  const style = getAvatarStyle(nome);

  if (foto) {
    return (
      <div className={`${size} rounded-full overflow-hidden ring-2 ${style.ring} shadow-sm shrink-0`}>
        <img src={foto} alt={nome} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${size} rounded-full ${style.bg} ring-2 ${style.ring} flex items-center justify-center text-fc-dark ${textSize} font-black shadow-sm shrink-0`}>
      {getInitials(nome)}
    </div>
  );
}
