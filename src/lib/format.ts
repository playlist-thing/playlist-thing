const secs_per_hour = 60 * 60;

export function formatSeconds(seconds: number) {
  const hours = Math.floor(seconds / secs_per_hour);
  const mins_secs = seconds % secs_per_hour;
  const mins = Math.floor(mins_secs / 60);
  const secs = mins_secs % 60;
  const secsPadded = `${secs}`.padStart(2, '0');

  if (hours > 0) {
    const minsPadded = `${mins}`.padStart(2, '0');
    return `${hours}:${minsPadded}:${secsPadded}`;
  } else {
    return `${mins}:${secsPadded}`;
  }
}

export function formatClockTime(date: Date) {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((part) => `${part}`.padStart(2, '0'))
    .join(':');
}

export function formatClockDate(date: Date) {
  return date.toLocaleDateString();
}

export function parseDuration(raw: string) {
  const split = raw.split(':');
  let result = 0;

  if (split.length > 3) {
    return 0;
  }

  for (const raw of split) {
    result *= 60;
    result += Number.parseInt(raw);
  }

  if (Number.isNaN(result)) result = 0;
  if (result < 0) result = 0;

  return result;
}
