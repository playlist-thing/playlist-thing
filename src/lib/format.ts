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

const relativeTimeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export function formatRelativeTime(epochMilliseconds: number, now: number = Date.now()) {
  const seconds = (epochMilliseconds - now) / 1000;
  const abs = Math.abs(seconds);

  let value: number;
  let unit: Intl.RelativeTimeFormatUnit;

  if (abs < 60) {
    [value, unit] = [seconds, 'second'];
  } else if (abs < 60 * 60) {
    [value, unit] = [seconds / 60, 'minute'];
  } else if (abs < 24 * 60 * 60) {
    [value, unit] = [seconds / (60 * 60), 'hour'];
  } else if (abs < 7 * 24 * 60 * 60) {
    [value, unit] = [seconds / (24 * 60 * 60), 'day'];
  } else if (abs < 4.34524 * 7 * 24 * 60 * 60) {
    [value, unit] = [seconds / (7 * 24 * 60 * 60), 'week'];
  } else if (abs < 12 * 30.436875 * 24 * 60 * 60) {
    [value, unit] = [seconds / (30.436875 * 24 * 60 * 60), 'month'];
  } else {
    [value, unit] = [seconds / (365.2425 * 24 * 60 * 60), 'year'];
  }

  return relativeTimeFormat.format(Math.round(value), unit);
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
