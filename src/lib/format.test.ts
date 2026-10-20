import { expect, test } from 'vitest';
import {
  formatClockDate,
  formatClockTime,
  formatDateTime,
  formatInputDateTime,
  formatRelativeTime,
  formatSeconds,
  parseDuration,
  parseInputDateTime
} from './format';

test('formatSeconds', () => {
  expect(formatSeconds(0)).toEqual('0:00');
  expect(formatSeconds(10)).toEqual('0:10');
  expect(formatSeconds(60)).toEqual('1:00');
  expect(formatSeconds(80)).toEqual('1:20');
  expect(formatSeconds(600)).toEqual('10:00');
  expect(formatSeconds(3600)).toEqual('1:00:00');
  expect(formatSeconds(3660)).toEqual('1:01:00');
});

test('parseDuration valid durations', () => {
  expect(parseDuration('0')).toEqual(0);
  expect(parseDuration('10')).toEqual(10);
  expect(parseDuration('60')).toEqual(60);
  expect(parseDuration('600')).toEqual(600);

  expect(parseDuration('0:00')).toEqual(0);
  expect(parseDuration('0:10')).toEqual(10);
  expect(parseDuration('1:00')).toEqual(60);
  expect(parseDuration('1:20')).toEqual(80);
  expect(parseDuration('10:00')).toEqual(600);
  expect(parseDuration('60:00')).toEqual(3600);
  expect(parseDuration('61:00')).toEqual(3660);

  expect(parseDuration('1:00:00')).toEqual(3600);
  expect(parseDuration('1:01:00')).toEqual(3660);
});

test('parseDuration invalid durations', () => {
  expect(parseDuration('a')).toEqual(0);
  expect(parseDuration('1:00:00:00')).toEqual(0);
});

test('formatClockTime pads to 24-hour HH:MM:SS', () => {
  expect(formatClockTime(new Date(2026, 0, 1, 0, 0, 0), null)).toEqual('00:00:00');
  expect(formatClockTime(new Date(2026, 0, 1, 9, 5, 3), null)).toEqual('09:05:03');
  expect(formatClockTime(new Date(2026, 0, 1, 13, 7, 42), null)).toEqual('13:07:42');
  expect(formatClockTime(new Date(2026, 0, 1, 23, 59, 59), null)).toEqual('23:59:59');
});

test('formatClockDate uses the locale date format', () => {
  const date = new Date(2026, 0, 1, 12, 0, 0);
  expect(formatClockDate(date, null)).toEqual(date.toLocaleDateString());
});

test('formatClockTime and formatClockDate respect the time zone', () => {
  // 2026-01-01T23:30:00Z
  const date = new Date(Date.UTC(2026, 0, 1, 23, 30, 0));

  expect(formatClockTime(date, 'UTC')).toEqual('23:30:00');
  expect(formatClockTime(date, 'Europe/Berlin')).toEqual('00:30:00');
  expect(formatClockDate(date, 'Europe/Berlin')).toEqual(
    new Date(Date.UTC(2026, 0, 2, 0, 30, 0)).toLocaleDateString(undefined, {
      timeZone: 'Europe/Berlin'
    })
  );
});

test('formatDateTime respects the time zone', () => {
  // 2026-01-01T23:30:00Z
  const epochMilliseconds = Date.UTC(2026, 0, 1, 23, 30, 0);

  expect(formatDateTime(epochMilliseconds, 'Europe/Berlin')).toEqual(
    new Date(epochMilliseconds).toLocaleString(undefined, { timeZone: 'Europe/Berlin' })
  );
});

test('formatInputDateTime formats for a datetime-local input in the given time zone', () => {
  // 2026-01-01T23:30:00Z
  const epochMilliseconds = Date.UTC(2026, 0, 1, 23, 30, 0);

  expect(formatInputDateTime(epochMilliseconds, 'UTC')).toEqual('2026-01-01T23:30');
  expect(formatInputDateTime(epochMilliseconds, 'Europe/Berlin')).toEqual('2026-01-02T00:30');
});

test('formatInputDateTime uses the local time zone when none is set', () => {
  const epochMilliseconds = Date.UTC(2026, 0, 1, 23, 30, 0);
  const date = new Date(epochMilliseconds);
  const pad = (n: number) => String(n).padStart(2, '0');

  expect(formatInputDateTime(epochMilliseconds, null)).toEqual(
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
});

test('parseInputDateTime parses a datetime-local value in the given time zone', () => {
  expect(parseInputDateTime('2026-01-01T23:30', 'UTC')).toEqual(Date.UTC(2026, 0, 1, 23, 30, 0));
  expect(parseInputDateTime('2026-01-02T00:30', 'Europe/Berlin')).toEqual(
    Date.UTC(2026, 0, 1, 23, 30, 0)
  );
});

test('parseInputDateTime is the inverse of formatInputDateTime', () => {
  for (const timeZone of ['UTC', 'Europe/Berlin', 'America/New_York', 'Asia/Kolkata']) {
    // Instants spanning both DST transitions in the northern hemisphere.
    for (const epochMilliseconds of [
      Date.UTC(2026, 0, 15, 12, 34, 0),
      Date.UTC(2026, 3, 15, 12, 34, 0),
      Date.UTC(2026, 6, 15, 12, 34, 0),
      Date.UTC(2026, 9, 15, 12, 34, 0)
    ]) {
      const value = formatInputDateTime(epochMilliseconds, timeZone);
      expect(parseInputDateTime(value, timeZone)).toEqual(epochMilliseconds);
    }
  }
});

test('parseInputDateTime returns NaN for empty or invalid input', () => {
  expect(parseInputDateTime('', 'UTC')).toBeNaN();
  expect(parseInputDateTime('not a date', 'UTC')).toBeNaN();
});

test('formatRelativeTime picks the appropriate unit', () => {
  const now = new Date(2026, 0, 1, 12, 0, 0).getTime();

  expect(formatRelativeTime(now - 10 * 1000, now)).toEqual('10 seconds ago');
  expect(formatRelativeTime(now - 5 * 60 * 1000, now)).toEqual('5 minutes ago');
  expect(formatRelativeTime(now - 3 * 60 * 60 * 1000, now)).toEqual('3 hours ago');
  expect(formatRelativeTime(now - 2 * 24 * 60 * 60 * 1000, now)).toEqual('2 days ago');
  expect(formatRelativeTime(now - 60 * 24 * 60 * 60 * 1000, now)).toEqual('2 months ago');
  expect(formatRelativeTime(now - 400 * 24 * 60 * 60 * 1000, now)).toEqual('last year');
});

test('formatRelativeTime handles past and future timestamps', () => {
  const now = new Date(2026, 0, 1, 12, 0, 0).getTime();

  expect(formatRelativeTime(now, now)).toEqual('now');
  expect(formatRelativeTime(now + 60 * 1000, now)).toEqual('in 1 minute');
  expect(formatRelativeTime(now - 60 * 1000, now)).toEqual('1 minute ago');
});
