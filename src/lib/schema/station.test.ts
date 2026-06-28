import { expect, test } from 'vitest';
import { StationSchema } from './station.ts';
import { validStation } from './examples.ts';

const validStationWithManualVerification = {
  ...validStation,
  domains: [
    {
      domain: 'example.com',
      verification: {
        tag: 'ManualDomainVerification',
        content: {
          verifiedAt: 1234567890
        }
      }
    }
  ]
};

const validStationWithNullVerification = {
  ...validStation,
  domains: [
    {
      domain: 'example.com',
      verification: null
    }
  ]
};

test('valid station with automatic domain verification passes', () => {
  expect(StationSchema.safeParse(validStation).success).toBe(true);
});

test('valid station with manual domain verification passes', () => {
  expect(StationSchema.safeParse(validStationWithManualVerification).success).toBe(true);
});

test('valid station with null verification passes', () => {
  expect(StationSchema.safeParse(validStationWithNullVerification).success).toBe(true);
});

test('invalid UUID fails validation', () => {
  const invalidStation = { ...validStation, id: 'not-a-uuid' };
  expect(StationSchema.safeParse(invalidStation).success).toBe(false);
});

test('invalid verification tag fails validation', () => {
  const invalidStation = {
    ...validStation,
    domains: [
      {
        domain: 'example.com',
        verification: {
          tag: 'InvalidTag',
          content: {}
        }
      }
    ]
  };
  expect(StationSchema.safeParse(invalidStation).success).toBe(false);
});

test('invalid djIds UUID fails validation', () => {
  const invalidStation = { ...validStation, djIds: ['not-a-uuid'] };
  expect(StationSchema.safeParse(invalidStation).success).toBe(false);
});

test('missing required fields fail validation', () => {
  expect(StationSchema.safeParse({}).success).toBe(false);
});
