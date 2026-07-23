import { getInitials, getAvatarStyle } from '../utils/playerVisuals';

export default function Avatar({ nome, size = 'w-9 h-9', textSize = 'text-[11px]' }) {
  const style = getAvatarStyle(nome);
  return (
    <div className={`${size} rounded-full ${style.bg} ring-2 ${style.ring} flex items-center justify-center text-fc-dark ${textSize} font-black shadow-sm shrink-0`}>
      {getInitials(nome)}
    </div>
  );
}
