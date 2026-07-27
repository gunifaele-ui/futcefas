export const DRAFT_JITTER = 0.6;
export const DRAFT_CANDIDATES = 60;
export const REPEAT_MATCH_WEIGHTS = [3, 1]; // peso do jogo anterior, depois do jogo anterior a esse

export function pairKey(idA, idB) {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

export function buildPairWeights(matchHistory, repeatMatchWeights = REPEAT_MATCH_WEIGHTS) {
  const weights = new Map();
  matchHistory.slice(0, repeatMatchWeights.length).forEach((match, idx) => {
    const weight = repeatMatchWeights[idx];
    match.teams.forEach((team) => {
      const ids = team.players.map((p) => p.id);
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const key = pairKey(ids[i], ids[j]);
          weights.set(key, (weights.get(key) || 0) + weight);
        }
      }
    });
  });
  return weights;
}

export function draftOnce(linePresent, numTimes, jitter = DRAFT_JITTER) {
  const withJitter = linePresent.map((p) => ({ player: p, key: p.notaMedia + (Math.random() - 0.5) * jitter }));
  withJitter.sort((a, b) => b.key - a.key);
  const sorted = withJitter.map((w) => w.player);

  const teams = Array.from({ length: numTimes }, (_, i) => ({
    id: `t${i + 1}`,
    name: `Time ${i + 1}`,
    players: [],
    ratingSum: 0,
  }));

  let ascending = true;
  let teamIdx = 0;

  for (let i = 0; i < sorted.length; i++) {
    const player = sorted[i];
    teams[teamIdx].players.push(player);
    teams[teamIdx].ratingSum += player.notaMedia;

    if (ascending) {
      if (teamIdx === numTimes - 1) ascending = false;
      else teamIdx++;
    } else {
      if (teamIdx === 0) ascending = true;
      else teamIdx--;
    }
  }

  return teams;
}

export function scoreDraft(teams, pairWeights) {
  let repeatCost = 0;
  teams.forEach((team) => {
    const ids = team.players.map((p) => p.id);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        repeatCost += pairWeights.get(pairKey(ids[i], ids[j])) || 0;
      }
    }
  });

  const avgRatings = teams.map((t) => t.ratingSum / t.players.length);
  const mean = avgRatings.reduce((a, b) => a + b, 0) / avgRatings.length;
  const balanceCost = avgRatings.reduce((sum, r) => sum + (r - mean) ** 2, 0);

  // Repeat pairings pesam muito mais que o desbalanço residual, já que o
  // próprio draftOnce já mantém os times parelhos por nível em qualquer ordem.
  return repeatCost * 1000 + balanceCost;
}

export function orderTeamsByStrength(teams) {
  const sorted = [...teams].sort((a, b) => a.ratingSum / a.players.length - b.ratingSum / b.players.length);
  return sorted.map((t, i) => ({ ...t, id: `t${i + 1}`, name: `Time ${i + 1}` }));
}

export function draftBalancedTeams(linePresent, numTimes, matchHistory, candidates = DRAFT_CANDIDATES) {
  const pairWeights = buildPairWeights(matchHistory);
  let bestTeams = null;
  let bestScore = Infinity;

  for (let i = 0; i < candidates; i++) {
    const candidate = draftOnce(linePresent, numTimes);
    const score = scoreDraft(candidate, pairWeights);
    if (score < bestScore) {
      bestScore = score;
      bestTeams = candidate;
    }
  }

  return bestTeams;
}
