export const AVATAR_PALETTE = [
  { grad: 'from-rose-400 to-rose-600', ring: 'ring-rose-200' },
  { grad: 'from-amber-400 to-amber-600', ring: 'ring-amber-200' },
  { grad: 'from-lime-400 to-lime-600', ring: 'ring-lime-200' },
  { grad: 'from-emerald-400 to-emerald-600', ring: 'ring-emerald-200' },
  { grad: 'from-teal-400 to-teal-600', ring: 'ring-teal-200' },
  { grad: 'from-cyan-400 to-cyan-600', ring: 'ring-cyan-200' },
  { grad: 'from-sky-400 to-sky-600', ring: 'ring-sky-200' },
  { grad: 'from-indigo-400 to-indigo-600', ring: 'ring-indigo-200' },
  { grad: 'from-violet-400 to-violet-600', ring: 'ring-violet-200' },
  { grad: 'from-fuchsia-400 to-fuchsia-600', ring: 'ring-fuchsia-200' },
  { grad: 'from-pink-400 to-pink-600', ring: 'ring-pink-200' },
  { grad: 'from-orange-400 to-orange-600', ring: 'ring-orange-200' },
];

export function getInitials(nome) {
  if (!nome) return '?';
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getAvatarStyle(nome) {
  if (!nome) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export function ratingTone(media) {
  if (media >= 8) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  if (media >= 6.5) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' };
  return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' };
}
