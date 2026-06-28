import { expect, test } from 'vitest';
import { ShowSchema } from './show.ts';
import { validShow } from './examples.ts';

test('valid show with null stationId passes validation', () => {
  expect(ShowSchema.safeParse({ ...validShow, stationId: null }).success).toBe(true);
});

test('valid show passes validation', () => {
  expect(ShowSchema.safeParse(validShow).success).toBe(true);
});

test('invalid UUID fails validation', () => {
  const invalidShow = { ...validShow, id: 'not-a-uuid' };
  expect(ShowSchema.safeParse(invalidShow).success).toBe(false);
});

test('invalid stationId UUID fails validation', () => {
  const invalidShow = { ...validShow, stationId: 'not-a-uuid' };
  expect(ShowSchema.safeParse(invalidShow).success).toBe(false);
});

test('invalid stationId type fails validation', () => {
  const invalidShow = { ...validShow, stationId: 123 };
  expect(ShowSchema.safeParse(invalidShow).success).toBe(false);
});

test('invalid djIds UUID fails validation', () => {
  const invalidShow = { ...validShow, djIds: ['not-a-uuid'] };
  expect(ShowSchema.safeParse(invalidShow).success).toBe(false);
});

test('missing required fields fails validation', () => {
  expect(ShowSchema.safeParse({}).success).toBe(false);
});
