import { expect, test } from 'vitest';
import { DJSchema } from './dj.ts';

const validDJ = {
  id: '5d883c03-bafb-4beb-aeef-881618723f43',
  name: 'Test DJ',
  slug: 'test-dj',
  description: 'A test DJ',
  public: true,
  links: ['https://example.com']
};

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
