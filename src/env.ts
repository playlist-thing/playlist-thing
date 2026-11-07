import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value ?? '';

export const variables = defineEnvVars({
  PUBLIC_PRIVACY_POLICY_URL: { public: true, schema: optional },
  PUBLIC_IMPRINT_URL: { public: true, schema: optional },
  PUBLIC_ACCOUNT_MANAGER_URL: { public: true, schema: optional },
  PUBLIC_SPOTIFY_CLIENT_ID: { public: true, schema: optional },
  PUBLIC_API_CLIENT_ID: { public: true, schema: optional },
  PUBLIC_API_AUTH_METADATA_URL: { public: true, schema: optional }
});
