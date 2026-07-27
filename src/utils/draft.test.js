import { describe, it, expect } from 'vitest';
import { draftOnce, scoreDraft, draftBalancedTeams, buildPairWeights, orderTeamsByStrength } from './draft';

function makePlayers(count, ratingFn = () => 7) {
  return Array.from({ length: count }, (_, i) => ({ id: `p${i}`, nome: `Jogador ${i}`, notaMedia: ratingFn(i) }));
}

function allPlayerIds(teams) {
  return teams.flatMap((t) => t.players.map((p) => p.id));
}

describe('draftOnce', () => {
  it('distributes every player into exactly one team', () => {
    const players = makePlayers(17);
    const teams = draftOnce(players, 3, 0);
    const ids = allPlayerIds(teams);
    expect(ids).toHaveLength(players.length);
    expect(new Set(ids).size).toBe(players.length);
  });

  it('keeps team sizes balanced within 1 player of each other', () => {
    const players = makePlayers(17);
    const teams = draftOnce(players, 3, 0);
    const sizes = teams.map((t) => t.players.length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it('snakes ratings so team averages stay close (no jitter)', () => {
    const players = makePlayers(20, (i) => 5 + i * 0.2); // spread of ratings
    const teams = draftOnce(players, 4, 0);
    const averages = teams.map((t) => t.ratingSum / t.players.length);
    const spread = Math.max(...averages) - Math.min(...averages);
    expect(spread).toBeLessThan(1); // snake draft should keep averages close
  });
});

describe('scoreDraft', () => {
  it('penalizes teams that repeat a pair from recent history', () => {
    const players = makePlayers(6);
    const teams = draftOnce(players, 2, 0);
    const samePair = [teams[0].players[0].id, teams[0].players[1].id];
    const weightsWithRepeat = new Map([[samePair.sort().join('|'), 3]]);

    const scoreWithoutHistory = scoreDraft(teams, new Map());
    const scoreWithHistory = scoreDraft(teams, weightsWithRepeat);

    expect(scoreWithHistory).toBeGreaterThan(scoreWithoutHistory);
  });
});

describe('buildPairWeights', () => {
  it('only looks at as many recent matches as there are configured weights', () => {
    const matchOf = (ids) => ({ teams: [{ players: ids.map((id) => ({ id })) }] });
    const matchHistory = [matchOf(['a', 'b']), matchOf(['c', 'd']), matchOf(['e', 'f'])];

    const weights = buildPairWeights(matchHistory, [3, 1]);

    expect(weights.get('a|b')).toBe(3);
    expect(weights.get('c|d')).toBe(1);
    expect(weights.has('e|f')).toBe(false); // além da janela configurada
  });
});

describe('draftBalancedTeams', () => {
  it('always includes every present player exactly once, with no duplicates', () => {
    const players = makePlayers(18, (i) => 5 + (i % 5));
    const teams = draftBalancedTeams(players, 3, [], 10);
    const ids = allPlayerIds(teams);
    expect(ids).toHaveLength(players.length);
    expect(new Set(ids).size).toBe(players.length);
  });

  it('keeps team rating averages within a reasonable spread', () => {
    const players = makePlayers(20, (i) => 5 + (i % 6));
    const teams = draftBalancedTeams(players, 4, [], 20);
    const averages = teams.map((t) => t.ratingSum / t.players.length);
    expect(Math.max(...averages) - Math.min(...averages)).toBeLessThan(1.5);
  });
});

describe('orderTeamsByStrength', () => {
  it('renames teams sequentially in ascending order of average rating', () => {
    const teams = [
      { id: 'x', name: 'X', players: [{ id: 'a' }, { id: 'b' }], ratingSum: 18 }, // avg 9
      { id: 'y', name: 'Y', players: [{ id: 'c' }, { id: 'd' }], ratingSum: 10 }, // avg 5
    ];
    const ordered = orderTeamsByStrength(teams);
    expect(ordered.map((t) => t.id)).toEqual(['t1', 't2']);
    expect(ordered[0].ratingSum).toBe(10);
    expect(ordered[1].ratingSum).toBe(18);
  });
});
