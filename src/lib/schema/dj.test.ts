import { expect, test } from 'vitest';
import { DJSchema } from './dj.ts';
import { validDJ } from './examples.ts';

test('valid DJ passes validation', () => {
  expect(DJSchema.safeParse(validDJ).success).toBe(true);
});

test('invalid UUID fails validation', () => {
  const invalidDJ = { ...validDJ, id: 'not-a-uuid' };
  expect(DJSchema.safeParse(invalidDJ).success).toBe(false);
});

test('missing required fields fail validation', () => {
  expect(DJSchema.safeParse({}).success).toBe(false);
});
