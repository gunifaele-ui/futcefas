const EMOJI_OK = /✅|✔️|✔|☑️|🟢|👍/;
const EMOJI_X = /❌|✖️|✖|🚫|🔴|👎/;
// Inclui símbolos/emoji visíveis e também caracteres invisíveis que o WhatsApp
// costuma inserir em listas numeradas (word joiner, zero-width space, variation selector).
const EMOJI_STRIP = new RegExp(
  '[\\u{1F000}-\\u{1FFFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\uFE0F\\u200B-\\u200D\\u2060\\uFEFF]',
  'gu'
);
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

function exactOrUniquePartial(norm, players) {
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

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// Corrige pequenos erros de digitação (ex: "Fellipe" -> "Felipe") sem arriscar
// confundir dois jogadores parecidos: só aceita se houver um único candidato mais próximo.
function fuzzyMatch(norm, players) {
  if (norm.length < 3) return null;
  const maxDist = norm.length <= 5 ? 1 : 2;
  const ranked = players
    .map((p) => ({ p, dist: levenshtein(norm, normalizeName(p.nome)) }))
    .filter(({ dist }) => dist <= maxDist)
    .sort((a, b) => a.dist - b.dist);
  if (ranked.length === 0) return null;
  if (ranked.length > 1 && ranked[0].dist === ranked[1].dist) return null;
  return ranked[0].p;
}

// Nomes tipo "Rafa (thiaguinho)" ou "Fellipe (cussi)" — o apelido entre parênteses
// pode coincidir com o nome de outra pessoa, então o nome principal tem prioridade.
function splitParenthetical(name) {
  const m = name.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (!m) return { main: name, alt: null };
  return { main: m[1].trim(), alt: m[2].trim() || null };
}

export function matchPlayer(name, players) {
  const { main, alt } = splitParenthetical(name);
  const normMain = normalizeName(main);

  let result = exactOrUniquePartial(normMain, players) || fuzzyMatch(normMain, players);
  if (result) return result;

  if (alt) {
    const normAlt = normalizeName(alt);
    result = exactOrUniquePartial(normAlt, players) || fuzzyMatch(normAlt, players);
    if (result) return result;
  }

  return exactOrUniquePartial(normalizeName(name), players);
}

function isAvulsosHeader(line) {
  const cleaned = line.replace(/[:\-–—]+$/, '').trim();
  return /^avulsos?$/i.test(normalizeName(cleaned));
}

function isGoleirosHeader(line) {
  const cleaned = line.replace(/[:\-–—]+$/, '').trim();
  return /^goleiros?$/i.test(normalizeName(cleaned));
}

export function parseAttendanceText(rawText, players) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const matched = [];
  const avulsosToCreate = [];
  const goleirosToCreate = [];
  const unmatched = [];
  let section = null; // null | 'avulsos' | 'goleiros'

  for (const line of lines) {
    if (isAvulsosHeader(line)) {
      section = 'avulsos';
      continue;
    }
    if (isGoleirosHeader(line)) {
      section = 'goleiros';
      continue;
    }

    // Só ✅ (e variantes) conta como presença confirmada. ❌ e linhas sem emoji
    // nenhum são tratadas como "não vai" — quem não respondeu não vai por padrão.
    const present = EMOJI_OK.test(line);
    const name = line.replace(EMOJI_STRIP, '').replace(LEADING_MARKERS, '').trim();

    if (!name) continue;

    // Always try to match against the full roster first, regardless of section,
    // so a player who already exists (e.g. a known goleiro) is never re-created
    // as a new avulso/goleiro just because of which header they were listed under.
    const match = matchPlayer(name, players);
    if (match) {
      matched.push({ player: match, present, rawLine: line });
      continue;
    }

    if (section === 'avulsos') {
      avulsosToCreate.push({ nome: name, present, rawLine: line });
    } else if (section === 'goleiros') {
      goleirosToCreate.push({ nome: name, present, rawLine: line });
    } else {
      unmatched.push({ rawLine: line, name, present });
    }
  }

  return { matched, avulsosToCreate, goleirosToCreate, unmatched };
}
