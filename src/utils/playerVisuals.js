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
  if (media >= 8) return { text: 'text-fc-dark', bg: 'bg-fc-lime/15', border: 'border-fc-lime/30', bar: 'bg-fc-lime' };
  if (media >= 6.5) return { text: 'text-fc-ink/70', bg: 'bg-fc-cream', border: 'border-fc-line', bar: 'bg-fc-muted/50' };
  return { text: 'text-fc-coraldark', bg: 'bg-fc-coral/12', border: 'border-fc-coral/25', bar: 'bg-fc-coral' };
}
