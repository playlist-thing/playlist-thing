import { writable, get } from 'svelte/store';

export const timeInfoMode = writable('');

export function calculateBeginsAt(items) {
  let result = [];
  let sum = 0;

  for (const item of items) {
    result.push(sum);
    sum += item.seconds;
  }

  return result;
}

export function calculateTimeUntilEnd(items) {
  let result = [];
  let sum = 0;

  for (let i = items.length; i > 0; i--) {
    const item = items[i - 1];
    sum += item.seconds;
    result = [sum, ...result];
  }

  return result;
}

export function calculateTimeInfo(items, mode) {
  if (mode === 'beginsAt') {
    return calculateBeginsAt(items);
  } else if (mode === 'timeUntilEnd') {
    return calculateTimeUntilEnd(items);
  }
}

export const calculateTotalDuration = (items) => items.reduce((sum, item) => sum + item.seconds, 0);

export const calculateTotalDurationWithoutPauses = (items) =>
  calculateTotalDuration(items.filter((item) => !item.pause));
