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

export function formatClockTime(date: Date, timeZone: string | null) {
  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: timeZone ?? undefined,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return format.format(date);
}

export function formatClockDate(date: Date, timeZone: string | null) {
  return date.toLocaleDateString(undefined, { timeZone: timeZone ?? undefined });
}

export function formatDateTime(epochMilliseconds: number, timeZone: string | null) {
  return new Date(epochMilliseconds).toLocaleString(undefined, {
    timeZone: timeZone ?? undefined
  });
}

function inputDateTimeParts(epochMilliseconds: number, timeZone: string | null) {
  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: timeZone ?? undefined,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts: Record<string, string> = {};
  for (const { type, value } of format.formatToParts(epochMilliseconds)) {
    parts[type] = value;
  }

  return parts;
}

// epoch ms -> "YYYY-MM-DDTHH:mm" in the given time zone, for a datetime-local input
export function formatInputDateTime(epochMilliseconds: number, timeZone: string | null) {
  const parts = inputDateTimeParts(epochMilliseconds, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

// The offset (in ms) of the given time zone from UTC at the given instant.
function timeZoneOffsetMs(epochMilliseconds: number, timeZone: string | null) {
  const parts = inputDateTimeParts(epochMilliseconds, timeZone);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute)
  );

  // `asUtc` drops the seconds, so round the instant down to the minute as well.
  return asUtc - Math.floor(epochMilliseconds / 60000) * 60000;
}

// "YYYY-MM-DDTHH:mm" interpreted in the given time zone -> epoch ms
export function parseInputDateTime(value: string, timeZone: string | null) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return NaN;

  const asUtc = Date.parse(`${value}:00Z`);
  if (Number.isNaN(asUtc)) return NaN;

  // Recover the offset at this instant, then re-apply it to account for any DST
  // transition between the first guess and the actual instant.
  const offset = timeZoneOffsetMs(asUtc, timeZone);
  return asUtc - timeZoneOffsetMs(asUtc - offset, timeZone);
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
