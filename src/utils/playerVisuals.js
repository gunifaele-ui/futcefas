const AVATAR_STYLE = { bg: 'bg-fc-cream', ring: 'ring-fc-line' };

export function getInitials(nome) {
  if (!nome) return '?';
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getAvatarStyle() {
  return AVATAR_STYLE;
}

export function ratingTone(media) {
  if (media >= 8) return { text: 'text-emerald-700', bg: 'bg-emerald-50/70', border: 'border-emerald-100', bar: 'bg-emerald-400' };
  if (media >= 6.5) return { text: 'text-fc-dark/70', bg: 'bg-fc-cream', border: 'border-fc-line', bar: 'bg-fc-lime' };
  return { text: 'text-fc-coraldark', bg: 'bg-orange-50/60', border: 'border-orange-100', bar: 'bg-fc-coral' };
}
