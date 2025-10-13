import { expect, test } from 'vitest';
import { formatSeconds, parseDuration } from './format.ts';

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
