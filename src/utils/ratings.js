const ACCENT_REGEX = new RegExp('[̀-ͯ]', 'g');

export function ratingFieldFor(adminKey) {
  return 'nota' + adminKey.charAt(0).toUpperCase() + adminKey.slice(1);
}

export function activeRaters(admins) {
  return admins.filter((a) => !a.hidden);
}

export function computeNotaMedia(player, admins) {
  const values = activeRaters(admins)
    .map((a) => player[ratingFieldFor(a.key)])
    .filter((v) => v != null);
  if (values.length === 0) return 0;
  return parseFloat((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2));
}

export function missingRaterLabels(player, admins) {
  return activeRaters(admins)
    .filter((a) => player[ratingFieldFor(a.key)] == null)
    .map((a) => a.label);
}

export function slugifyAdminKey(label) {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(ACCENT_REGEX, '')
    .replace(/[^a-z0-9]+/g, '');
}
