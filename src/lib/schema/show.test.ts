import { expect, test } from 'vitest';
import { ShowSchema } from './show';
import { validShow } from './examples';

test('valid show passes validation', () => {
  expect(ShowSchema.safeParse(validShow).success).toBe(true);
});

test('invalid UUID fails validation', () => {
  const invalidShow = { ...validShow, id: 'not-a-uuid' };
  expect(ShowSchema.safeParse(invalidShow).success).toBe(false);
});

test('invalid stationIds UUID fails validation', () => {
  const invalidShow = { ...validShow, stationIds: ['not-a-uuid'] };
  expect(ShowSchema.safeParse(invalidShow).success).toBe(false);
});

test('invalid stationIds type fails validation', () => {
  const invalidShow = { ...validShow, stationIds: [123] };
  expect(ShowSchema.safeParse(invalidShow).success).toBe(false);
});

test('invalid djIds UUID fails validation', () => {
  const invalidShow = { ...validShow, djIds: ['not-a-uuid'] };
  expect(ShowSchema.safeParse(invalidShow).success).toBe(false);
});

test('missing required fields fails validation', () => {
  expect(ShowSchema.safeParse({}).success).toBe(false);
});
