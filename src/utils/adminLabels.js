export const VIEWER_KEY = 'visualização';
export const VIEWER_LABEL = 'Visualizando';

export function getAdminLabel(admins, key) {
  if (key === VIEWER_KEY) return VIEWER_LABEL;
  const found = admins.find((a) => a.key === key);
  return found ? found.label : null;
}
