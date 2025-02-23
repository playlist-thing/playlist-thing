import type { PlaylistItem } from '$lib/playlist.ts';

function calculateBeginsAt(items: PlaylistItem[]) {
  let result: number[] = [];
  let sum = 0;

  for (const item of items) {
    result.push(sum);
    sum += item.seconds;
  }

  return result;
}

function calculateTimeUntilEnd(items: PlaylistItem[]) {
  let result: number[] = [];
  let sum = 0;

  for (let i = items.length; i > 0; i--) {
    const item = items[i - 1];
    sum += item.seconds;
    result.push(sum);
  }

  return result.reverse();
}

export enum TimeInfoMode {
  Duration,
  BeginsAt,
  TimeUntilEnd
}

export function calculateTimeInfo(items: PlaylistItem[], mode: TimeInfoMode): number[] {
  switch (mode) {
    case TimeInfoMode.Duration:
      return items.map((item) => item.seconds);
    case TimeInfoMode.BeginsAt:
      return calculateBeginsAt(items);
    case TimeInfoMode.TimeUntilEnd:
      return calculateTimeUntilEnd(items);
  }
}

export const calculateTotalDuration = (items: PlaylistItem[]) =>
  items.reduce((sum, item) => sum + item.seconds, 0);

export const calculateTotalDurationSongsOnly = (items: PlaylistItem[]) =>
  calculateTotalDuration(items.filter((item) => item.tag === 'Song'));
