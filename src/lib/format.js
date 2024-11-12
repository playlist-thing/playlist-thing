export function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const secsPadded = `${secs}`.padStart(2, '0');
  return `${mins}:${secsPadded}`;
}

export function parseDuration(raw) {
  const split = raw.split(':');
  let result = 0;

  if (split.length === 1) {
    const secs = Number.parseInt(split[0]);
    result = secs;
  } else if (split.length === 2) {
    const mins = Number.parseInt(split[0]);
    const secs = Number.parseInt(split[1]);
    result = mins * 60 + secs;
  }

  if (Number.isNaN(result)) result = 0;
  return result;
}
