import { describe, it, expect } from 'vitest';
import { shuffleArray, getRandomInt, rollDiceValues, CardDeck } from './random';

describe('🎲 Random Utilities', () => {
  it('getRandomInt generates numbers within specified range', () => {
    for (let i = 0; i < 100; i++) {
      const val = getRandomInt(1, 6);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
    }
  });

  it('rollDiceValues returns correct count of dice in [1, 6]', () => {
    const dice = rollDiceValues(2, 6);
    expect(dice).toHaveLength(2);
    expect(dice[0]).toBeGreaterThanOrEqual(1);
    expect(dice[0]).toBeLessThanOrEqual(6);
    expect(dice[1]).toBeGreaterThanOrEqual(1);
    expect(dice[1]).toBeLessThanOrEqual(6);
  });

  it('shuffleArray preserves length and elements without mutating original', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffleArray(original);

    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
    // Verify original array is intact
    expect(original).toHaveLength(10);
  });

  it('CardDeck draws cards sequentially and auto-reshuffles when empty', () => {
    const initialCards = ['A', 'B', 'C'];
    const deck = new CardDeck(initialCards);

    expect(deck.remainingCount).toBe(3);
    const first = deck.draw();
    expect(initialCards).toContain(first);
    expect(deck.remainingCount).toBe(2);

    const second = deck.draw();
    expect(initialCards).toContain(second);
    expect(deck.remainingCount).toBe(1);

    const third = deck.draw();
    expect(initialCards).toContain(third);
    expect(deck.remainingCount).toBe(0);

    // Auto-reshuffle on 4th draw
    const fourth = deck.draw();
    expect(initialCards).toContain(fourth);
    expect(deck.remainingCount).toBe(2);
  });
});
