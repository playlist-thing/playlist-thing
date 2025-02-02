import Item from '$lib/Item.svelte.ts';

function calculateBeginsAt(items: Item[]) {
  let result: number[] = [];
  let sum = 0;

  for (const item of items) {
    result.push(sum);
    sum += item.seconds;
  }

  return result;
}

function calculateTimeUntilEnd(items: Item[]) {
  let result: number[] = [];
  let sum = 0;

  for (let i = items.length; i > 0; i--) {
    const item = items[i - 1];
    sum += item.seconds;
    result.push(sum);
  }

  return result.reverse();
}

export function calculateTimeInfo(items: Item[], mode: string) {
  if (mode === 'duration') {
    return items.map((item) => item.seconds);
  } else if (mode === 'beginsAt') {
    return calculateBeginsAt(items);
  } else if (mode === 'timeUntilEnd') {
    return calculateTimeUntilEnd(items);
  }
}

export const calculateTotalDuration = (items: Item[]) =>
  items.reduce((sum, item) => sum + item.seconds, 0);

export const calculateTotalDurationWithoutPauses = (items: Item[]) =>
  calculateTotalDuration(items.filter((item) => !item.pause));
