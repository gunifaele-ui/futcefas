const MIN_QUARTER_MATCHES_FOR_ATTENDANCE = 3;
const MIN_PAIR_COUNT = 3;
const EM_ALTA_THRESHOLD = 1;
const EM_ALTA_MIN_DAYS = 20;
const EM_ALTA_MAX_DAYS = 45;
const DAY_MS = 24 * 60 * 60 * 1000;

function teamResultCount(match, team, type) {
  if (typeof team[type] === 'number') return team[type];
  if (type === 'vitorias' && match.winners?.includes(team.id)) return 1;
  return 0;
}

function isSameQuarter(isoDate, ref) {
  const d = new Date(isoDate);
  return d.getFullYear() === ref.getFullYear() && Math.floor(d.getMonth() / 3) === Math.floor(ref.getMonth() / 3);
}

function quarterKey(isoDate) {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

function maxRunLength(sequence) {
  let max = 0;
  let run = 0;
  sequence.forEach((val) => {
    if (val) {
      run++;
      max = Math.max(max, run);
    } else {
      run = 0;
    }
  });
  return max;
}

function buildPlayerMatchStats(matchHistory = []) {
  const sorted = [...matchHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const stats = new Map();
  const ensure = (id, nome) => {
    if (!stats.has(id)) stats.set(id, { id, nome, matches: [] });
    return stats.get(id);
  };

  sorted.forEach((m) => {
    if (!m) return;
    const goals = Array.isArray(m.goals) ? m.goals : [];
    const teams = Array.isArray(m.teams) ? m.teams : [];
    teams.forEach((t) => {
      if (!t) return;
      const teamWon = teamResultCount(m, t, 'vitorias') > 0;
      const players = Array.isArray(t.players) ? t.players : [];
      players.forEach((p) => {
        if (!p || !p.id) return;
        const entry = ensure(p.id, p.nome);
        const goal = goals.find((g) => g && g.playerId === p.id);
        entry.matches.push({
          date: m.date,
          gols: goal?.gols || 0,
          assistencias: goal?.assistencias || 0,
          vitoria: teamWon,
        });
      });
    });
  });

  return stats;
}

function currentStreak(playerId, matchHistoryDesc = []) {
  let streak = 0;
  for (const m of matchHistoryDesc) {
    if (!m) continue;
    const teams = Array.isArray(m.teams) ? m.teams : [];
    const played = teams.some((t) => t && Array.isArray(t.players) && t.players.some((p) => p && p.id === playerId));
    if (played) streak++;
    else break;
  }
  return streak;
}

function maxWinStreak(matches = []) {
  let max = 0;
  let cur = 0;
  matches.forEach((m) => {
    if (m?.vitoria) {
      cur++;
      max = Math.max(max, cur);
    } else {
      cur = 0;
    }
  });
  return max;
}

function currentDrySpell(matchesDesc = []) {
  let streak = 0;
  for (const m of matchesDesc) {
    if (m?.gols === 0) streak++;
    else break;
  }
  return streak;
}

// Conta quantas sequências (runs) separadas de `true` bateram o tamanho mínimo —
// ex: [T,T,T,F,T,T,T,T,T] com threshold 3 dá 2 (uma run de 3, uma de 5).
function countQualifyingRuns(sequence, threshold) {
  let count = 0;
  let run = 0;
  sequence.forEach((val) => {
    if (val) {
      run++;
    } else {
      if (run >= threshold) count++;
      run = 0;
    }
  });
  if (run >= threshold) count++;
  return count;
}

function buildAttendanceRunCounts(playerIds = [], matchHistoryAsc = [], thresholds) {
  const counts = new Map();
  playerIds.forEach((id) => {
    const seq = matchHistoryAsc.map((m) => {
      if (!m) return false;
      const teams = Array.isArray(m.teams) ? m.teams : [];
      return teams.some((t) => t && Array.isArray(t.players) && t.players.some((p) => p && p.id === id));
    });
    counts.set(id, {
      ferro: countQualifyingRuns(seq, thresholds.ferro),
      titanio: countQualifyingRuns(seq, thresholds.titanio),
    });
  });
  return counts;
}

function buildPlayedRunCounts(statsById, thresholds) {
  const counts = new Map();
  statsById.forEach((entry, id) => {
    const matches = Array.isArray(entry.matches) ? entry.matches : [];
    const winSeq = matches.map((m) => m.vitoria);
    const drySeq = matches.map((m) => m.gols === 0);
    counts.set(id, {
      trator: countQualifyingRuns(winSeq, thresholds.trator),
      seca: countQualifyingRuns(drySeq, thresholds.seca),
    });
  });
  return counts;
}

function buildStatsList(matches = []) {
  const map = new Map();
  const ensure = (id, nome) => {
    if (!map.has(id)) map.set(id, { id, nome, gols: 0, assistencias: 0, presencas: 0, vitorias: 0 });
    return map.get(id);
  };

  (matches || []).forEach((m) => {
    if (!m) return;
    const goals = Array.isArray(m.goals) ? m.goals : [];
    const teams = Array.isArray(m.teams) ? m.teams : [];
    teams.forEach((t) => {
      if (!t) return;
      const vitorias = teamResultCount(m, t, 'vitorias');
      const players = Array.isArray(t.players) ? t.players : [];
      players.forEach((p) => {
        if (!p || !p.id) return;
        const entry = ensure(p.id, p.nome);
        entry.presencas += 1;
        entry.vitorias += vitorias;
      });
    });
    goals.forEach((g) => {
      if (!g || !g.playerId) return;
      const entry = ensure(g.playerId, g.nome);
      entry.gols += g.gols || 0;
      entry.assistencias += g.assistencias || 0;
    });
  });

  return [...map.values()];
}

function buildQuarterStats(matchHistory, now) {
  const quarterMatches = (matchHistory || []).filter((m) => m && isSameQuarter(m.date, now));
  return { list: buildStatsList(quarterMatches), quarterMatchCount: quarterMatches.length };
}

function leadersFor(quarterStatsList, statKey) {
  const candidates = (quarterStatsList || []).filter((s) => s && s[statKey] > 0);
  if (candidates.length === 0) return [];
  const max = Math.max(...candidates.map((s) => s[statKey]));
  return candidates.filter((s) => s[statKey] === max);
}

function undisputedQuarterLeader(quarterStatsList, statKey) {
  const tied = leadersFor(quarterStatsList, statKey);
  return tied.length === 1 ? tied[0] : null;
}

function topPair(matchHistory = []) {
  const pairCounts = new Map();
  (matchHistory || []).forEach((m) => {
    if (!m) return;
    const teams = Array.isArray(m.teams) ? m.teams : [];
    teams.forEach((t) => {
      if (!t) return;
      const roster = (t.players || []).filter((p) => p && p.id);
      for (let i = 0; i < roster.length; i++) {
        for (let j = i + 1; j < roster.length; j++) {
          const key = [roster[i].id, roster[j].id].sort().join('::');
          pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
        }
      }
    });
  });

  let bestKey = null;
  let bestCount = 0;
  pairCounts.forEach((count, key) => {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  });

  if (!bestKey || bestCount < MIN_PAIR_COUNT) return null;
  return { ids: bestKey.split('::'), count: bestCount };
}

function ratingImprovement(playerId, ratingHistory = [], currentNota) {
  if (currentNota == null) return null;
  const now = Date.now();
  const minTime = now - EM_ALTA_MAX_DAYS * DAY_MS;
  const maxTime = now - EM_ALTA_MIN_DAYS * DAY_MS;
  const candidates = ratingHistory
    .filter((r) => r.playerId === playerId)
    .filter((r) => {
      const t = new Date(r.date).getTime();
      return t >= minTime && t <= maxTime;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  if (candidates.length === 0) return null;
  return currentNota - candidates[0].notaMedia;
}

// Ordem = prioridade pro selo exibido no avatar (troféus/raridade primeiro).
export const BADGE_DEFINITIONS = [
  {
    id: 'campeao_trimestre',
    icon: '🏆',
    label: 'Campeão do Trimestre',
    description: 'Mais vitórias no trimestre atual.',
    compute: (ctx, player) => {
      const leader = ctx.quarterCampeao;
      const achieved = !!leader && leader.id === player.id;
      return { achieved, detail: achieved ? `${leader.vitorias} vitórias` : null };
    },
  },
  {
    id: 'artilheiro',
    icon: '⚽',
    label: 'Artilheiro',
    description: 'Mais gols no trimestre atual.',
    compute: (ctx, player) => {
      const leader = ctx.quarterArtilheiro;
      const achieved = !!leader && leader.id === player.id;
      return { achieved, detail: achieved ? `${leader.gols} gols` : null };
    },
  },
  {
    id: 'garcom',
    icon: '🎯',
    label: 'Garçom',
    description: 'Mais assistências no trimestre atual.',
    compute: (ctx, player) => {
      const leader = ctx.quarterGarcom;
      const achieved = !!leader && leader.id === player.id;
      return { achieved, detail: achieved ? `${leader.assistencias} assist.` : null };
    },
  },
  {
    id: 'sequencia_titanio',
    icon: '💎',
    label: 'Sequência de Titânio',
    description: '20 peladas seguidas sem faltar.',
    compute: (ctx, player) => {
      const current = ctx.streaks.get(player.id) || 0;
      const count = ctx.attendanceRunCounts.get(player.id)?.titanio || 0;
      return { achieved: count > 0, count, detail: `${current} seguidas agora` };
    },
  },
  {
    id: 'veterano',
    icon: '🏛️',
    label: 'Veterano',
    description: '50 peladas jogadas.',
    compute: (ctx, player) => {
      const total = ctx.statsById.get(player.id)?.matches.length || 0;
      return { achieved: total >= 50, detail: `${total} peladas` };
    },
  },
  {
    id: 'trator',
    icon: '⚡',
    label: 'Trator',
    description: '3 ou mais vitórias seguidas.',
    compute: (ctx, player) => {
      const s = ctx.statsById.get(player.id);
      const best = s ? maxWinStreak(s.matches) : 0;
      const count = ctx.playedRunCounts.get(player.id)?.trator || 0;
      return { achieved: count > 0, count, detail: `${best} seguidas` };
    },
  },
  {
    id: 'hat_trick',
    icon: '🎩',
    label: 'Hat-trick',
    description: '3 ou mais gols numa pelada só.',
    compute: (ctx, player) => {
      const s = ctx.statsById.get(player.id);
      const count = s ? s.matches.filter((m) => m.gols >= 3).length : 0;
      const best = s ? Math.max(0, ...s.matches.map((m) => m.gols)) : 0;
      return { achieved: count > 0, count, detail: count > 0 ? `${best} gols numa pelada` : null };
    },
  },
  {
    id: 'sempre_presente',
    icon: '📅',
    label: 'Sempre Presente',
    description: 'Maior taxa de presença do trimestre.',
    compute: (ctx, player) => {
      const leader = ctx.quarterAttendanceLeader;
      const achieved = !!leader && leader.id === player.id;
      return { achieved, detail: achieved ? `${leader.pct}% de presença` : null };
    },
  },
  {
    id: 'sequencia_ferro',
    icon: '🔥',
    label: 'Sequência de Ferro',
    description: '5 peladas seguidas sem faltar.',
    compute: (ctx, player) => {
      const current = ctx.streaks.get(player.id) || 0;
      const count = ctx.attendanceRunCounts.get(player.id)?.ferro || 0;
      return { achieved: count > 0, count, detail: `${current} seguidas agora` };
    },
  },
  {
    id: 'parceria',
    icon: '🤝',
    label: 'Parceria',
    description: 'Integra a dupla mais frequente.',
    compute: (ctx, player) => {
      const pair = ctx.pair;
      const achieved = !!pair && pair.ids.includes(player.id);
      return { achieved, detail: achieved ? `${pair.count}x juntos` : null };
    },
  },
  {
    id: 'em_alta',
    icon: '📈',
    label: 'Em Alta',
    description: 'Nota subiu no último mês.',
    compute: (ctx, player) => {
      const diff = ratingImprovement(player.id, ctx.ratingHistory, player.notaMedia);
      const achieved = diff != null && diff >= EM_ALTA_THRESHOLD;
      return { achieved, detail: achieved ? `+${diff.toFixed(1)} no mês` : null };
    },
  },
  {
    id: 'fiel',
    icon: '🎖️',
    label: 'Fiel',
    description: '10 peladas jogadas.',
    compute: (ctx, player) => {
      const total = ctx.statsById.get(player.id)?.matches.length || 0;
      return { achieved: total >= 10, detail: `${total} peladas` };
    },
  },
  {
    id: 'estreante',
    icon: '🐣',
    label: 'Estreante',
    description: 'Jogou a primeira pelada.',
    compute: (ctx, player) => {
      const total = ctx.statsById.get(player.id)?.matches.length || 0;
      return { achieved: total === 1, detail: total === 1 ? 'Primeira pelada!' : null };
    },
  },
  {
    id: 'seca',
    icon: '🧊',
    label: 'Seca',
    description: '3 ou mais peladas seguidas sem marcar gol.',
    compute: (ctx, player) => {
      if (player.posicaoFixa === 'Goleiro') return { achieved: false, count: 0, detail: null };
      const s = ctx.statsById.get(player.id);
      if (!s || s.matches.length === 0) return { achieved: false, count: 0, detail: null };
      const current = currentDrySpell([...s.matches].reverse());
      const count = ctx.playedRunCounts.get(player.id)?.seca || 0;
      return { achieved: count > 0, count, detail: current >= 3 ? `${current} sem gol agora` : null };
    },
  },
];

export function computeBadgesForPlayers(players, matchHistory, ratingHistory = []) {
  const now = new Date();
  const statsById = buildPlayerMatchStats(matchHistory);
  const matchHistoryDesc = [...matchHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

  const streaks = new Map();
  statsById.forEach((_, id) => streaks.set(id, currentStreak(id, matchHistoryDesc)));

  const { list: quarterStats, quarterMatchCount } = buildQuarterStats(matchHistory, now);
  const quarterArtilheiro = undisputedQuarterLeader(quarterStats, 'gols');
  const quarterGarcom = undisputedQuarterLeader(quarterStats, 'assistencias');
  const quarterCampeao = undisputedQuarterLeader(quarterStats, 'vitorias');

  const quarterAttendanceLeader = (() => {
    if (quarterMatchCount < MIN_QUARTER_MATCHES_FOR_ATTENDANCE) return null;
    const withPct = quarterStats
      .filter((s) => s.presencas > 0)
      .map((s) => ({ ...s, pct: Math.round((s.presencas / quarterMatchCount) * 100) }));
    if (withPct.length === 0) return null;
    const max = Math.max(...withPct.map((s) => s.pct));
    const tied = withPct.filter((s) => s.pct === max);
    return tied.length === 1 ? tied[0] : null;
  })();

  const pair = topPair(matchHistory);

  const matchHistoryAsc = [...matchHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const attendanceRunCounts = buildAttendanceRunCounts([...statsById.keys()], matchHistoryAsc, { ferro: 5, titanio: 20 });
  const playedRunCounts = buildPlayedRunCounts(statsById, { trator: 3, seca: 3 });

  const ctx = {
    statsById,
    streaks,
    quarterArtilheiro,
    quarterGarcom,
    quarterCampeao,
    quarterAttendanceLeader,
    pair,
    ratingHistory,
    attendanceRunCounts,
    playedRunCounts,
  };

  const result = new Map();
  players.forEach((player) => {
    const badges = BADGE_DEFINITIONS.map((def) => {
      const { achieved, count, detail } = def.compute(ctx, player);
      return { id: def.id, icon: def.icon, label: def.label, description: def.description, achieved, count, detail };
    });
    result.set(player.id, badges);
  });
  return result;
}

export function getTopBadge(badges) {
  if (!Array.isArray(badges)) return null;
  return badges.find((b) => b?.achieved) || null;
}

function computeQuarterAwardsHistory(matchHistory = []) {
  const byQuarter = new Map();
  (matchHistory || []).forEach((m) => {
    if (!m || !m.date) return;
    const key = quarterKey(m.date);
    if (!byQuarter.has(key)) byQuarter.set(key, []);
    byQuarter.get(key).push(m);
  });

  const counts = new Map();
  const ensure = (id) => {
    if (!id) return { campeao: 0, artilheiro: 0, garcom: 0, sempre_presente: 0, total: 0 };
    if (!counts.has(id)) counts.set(id, { campeao: 0, artilheiro: 0, garcom: 0, sempre_presente: 0, total: 0 });
    return counts.get(id);
  };

  byQuarter.forEach((matches) => {
    const list = buildStatsList(matches);

    leadersFor(list, 'vitorias').forEach((s) => { if (s?.id) ensure(s.id).campeao += 1; });
    leadersFor(list, 'gols').forEach((s) => { if (s?.id) ensure(s.id).artilheiro += 1; });
    leadersFor(list, 'assistencias').forEach((s) => { if (s?.id) ensure(s.id).garcom += 1; });

    if (matches.length >= MIN_QUARTER_MATCHES_FOR_ATTENDANCE) {
      const withPct = list.filter((s) => s && s.presencas > 0).map((s) => ({ ...s, pct: Math.round((s.presencas / matches.length) * 100) }));
      leadersFor(withPct, 'pct').forEach((s) => { if (s?.id) ensure(s.id).sempre_presente += 1; });
    }
  });

  counts.forEach((c) => {
    c.total = c.campeao + c.artilheiro + c.garcom + c.sempre_presente;
  });

  return counts;
}

function bestPartnerFor(playerId, matchHistory = []) {
  const counts = new Map();
  (matchHistory || []).forEach((m) => {
    if (!m) return;
    const teams = Array.isArray(m.teams) ? m.teams : [];
    teams.forEach((t) => {
      if (!t) return;
      const players = Array.isArray(t.players) ? t.players.filter(Boolean) : [];
      const inTeam = players.some((p) => p.id === playerId);
      if (!inTeam) return;
      players.forEach((p) => {
        if (!p || !p.id || p.id === playerId) return;
        const cur = counts.get(p.id) || { id: p.id, nome: p.nome, count: 0 };
        cur.count += 1;
        counts.set(p.id, cur);
      });
    });
  });

  let best = null;
  counts.forEach((v) => {
    if (!best || v.count > best.count) best = v;
  });
  return best;
}

export function computeProfileStats(playerId, matchHistory = [], isGoleiro = false) {
  const safeHistory = Array.isArray(matchHistory) ? matchHistory : [];
  const statsById = buildPlayerMatchStats(safeHistory);
  const entry = statsById.get(playerId);
  const matches = entry?.matches || [];

  const vitorias = matches.filter((m) => m?.vitoria).length;
  const presencas = matches.length;
  const totals = {
    gols: matches.reduce((sum, m) => sum + (m?.gols || 0), 0),
    assistencias: matches.reduce((sum, m) => sum + (m?.assistencias || 0), 0),
    presencas,
    vitorias,
    pctVitorias: presencas > 0 ? Math.round((vitorias / presencas) * 100) : 0,
  };

  const maxGolsMatch = matches.length ? Math.max(0, ...matches.map((m) => m?.gols || 0)) : 0;
  const maxDrySpell = isGoleiro ? 0 : maxRunLength(matches.map((m) => m?.gols === 0));

  const matchHistoryAsc = [...safeHistory].sort((a, b) => new Date(a?.date || 0) - new Date(b?.date || 0));
  const presenceSeq = matchHistoryAsc.map((m) => {
    if (!m) return false;
    const teams = Array.isArray(m.teams) ? m.teams : [];
    return teams.some((t) => t && Array.isArray(t.players) && t.players.some((p) => p && p.id === playerId));
  });
  const maxAttendanceStreak = maxRunLength(presenceSeq);

  const partner = bestPartnerFor(playerId, safeHistory);
  const awards = computeQuarterAwardsHistory(safeHistory).get(playerId) || {
    campeao: 0,
    artilheiro: 0,
    garcom: 0,
    sempre_presente: 0,
    total: 0,
  };

  return { totals, maxGolsMatch, maxDrySpell, maxAttendanceStreak, partner, awards };
}

export function computeCareerTotals(matchHistory = []) {
  const safeHistory = Array.isArray(matchHistory) ? matchHistory : [];
  const statsById = buildPlayerMatchStats(safeHistory);
  const totals = new Map();
  statsById.forEach((entry, id) => {
    const matches = Array.isArray(entry?.matches) ? entry.matches : [];
    totals.set(id, {
      gols: matches.reduce((sum, m) => sum + (m?.gols || 0), 0),
      assistencias: matches.reduce((sum, m) => sum + (m?.assistencias || 0), 0),
      presencas: matches.length,
      vitorias: matches.filter((m) => m?.vitoria).length,
    });
  });
  return totals;
}
