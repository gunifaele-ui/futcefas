const EMOJI_OK = /✅|✔️|✔|☑️|🟢|👍/;
const EMOJI_X = /❌|✖️|✖|🚫|🔴|👎/;
const EMOJI_STRIP = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️‍]/gu;
const LEADING_MARKERS = /^[\s\-*•\d.)]+/;

export function normalizeName(str) {
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchPlayer(name, players) {
  const norm = normalizeName(name);
  if (!norm) return null;

  const exact = players.filter((p) => normalizeName(p.nome) === norm);
  if (exact.length === 1) return exact[0];

  const partial = players.filter((p) => {
    const pn = normalizeName(p.nome);
    return pn.includes(norm) || norm.includes(pn);
  });
  if (partial.length === 1) return partial[0];

  return null;
}

function isAvulsosHeader(line) {
  const cleaned = line.replace(/[:\-–—]+$/, '').trim();
  return /^avulsos?$/i.test(normalizeName(cleaned));
}

export function parseAttendanceText(rawText, players) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const matched = [];
  const avulsosToCreate = [];
  const unmatched = [];
  let inAvulsosSection = false;

  for (const line of lines) {
    if (isAvulsosHeader(line)) {
      inAvulsosSection = true;
      continue;
    }

    const present = EMOJI_OK.test(line) ? true : EMOJI_X.test(line) ? false : null;
    const name = line.replace(EMOJI_STRIP, '').replace(LEADING_MARKERS, '').trim();

    if (!name || present === null) continue;

    if (inAvulsosSection) {
      avulsosToCreate.push({ nome: name, present, rawLine: line });
      continue;
    }

    const match = matchPlayer(name, players);
    if (match) {
      matched.push({ player: match, present, rawLine: line });
    } else {
      unmatched.push({ rawLine: line, name, present });
    }
  }

  return { matched, avulsosToCreate, unmatched };
}
