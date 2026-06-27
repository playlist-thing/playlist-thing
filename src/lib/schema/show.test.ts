import { expect, test } from 'vitest';
import { ShowSchema } from './show.ts';

const validShow = {
  id: 'b441163b-1ab0-473c-a8d7-e91473a755e8',
  name: 'Test Show',
  slug: 'test-show',
  description: 'A test show',
  public: true,
  links: ['https://example.com'],
  stationId: 'c2cb2819-6a7f-43ca-9ebe-8e38781bf079',
  djIds: ['ca1d0b13-d870-4025-a77f-33e9960b20be', '9cf8e1cf-f63f-43f5-8e98-df3c940fc7f7']
};

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
