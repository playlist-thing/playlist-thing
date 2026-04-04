import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';

import * as openid from 'openid-client';

import localStorageStore from '$lib/localStorageStore.ts';

const scope = 'profile';

export const apiToken = localStorageStore('apiToken', '');
export const apiTokenRefresh = localStorageStore('apiTokenRefresh', '');
export const apiTokenExpiry = localStorageStore('apiTokenExpiry', 0);

export function tokenNeedsRefresh() {
  if (Date.now() > get(apiTokenExpiry)) return true;

  return false;
}

async function config() {
  if (!env.PUBLIC_API_CLIENT_ID) {
    throw new Error('API client ID missing');
  }

  const metadata_url = URL.parse(env.PUBLIC_API_AUTH_METADATA_URL);
  if (!metadata_url) {
    throw new Error('Invalid PUBLIC_API_AUTH_METADATA_URL');
  }

  const configuration = await openid.discovery(metadata_url, env.PUBLIC_API_CLIENT_ID);
  return configuration;
}

export async function redirectToSSOAuthorize() {
  const codeVerifier = openid.randomPKCECodeVerifier();
  const codeChallenge = openid.calculatePKCECodeChallenge(codeVerifier);

  sessionStorage.setItem('apiAuthCodeVerifier', codeVerifier);

  const state = openid.randomState();

  sessionStorage.setItem('apiAuthState', state);

  const authUrl = openid.buildAuthorizationUrl(await config(), {
    redirect_uri: `${location.origin}/oauth2/api/callback`,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: await codeChallenge,
    state
  });

  window.location.href = authUrl.toString();
}

export async function redirectToSSOLogout() {
  apiToken.set('');
  apiTokenRefresh.set('');
  apiTokenExpiry.set(0);

  const logoutUrl = openid.buildEndSessionUrl(await config());
  window.location.href = logoutUrl.toString();
}

function saveToken(response: openid.TokenEndpointResponse) {
  if (!response.refresh_token) {
    throw new Error('Response has no refresh_token');
  }

  if (!response.expires_in) {
    throw new Error('Response has no expires_in');
  }

  const expiry = Date.now() + response.expires_in * 1000;

  apiToken.set(response.access_token);
  apiTokenRefresh.set(response.refresh_token);
  apiTokenExpiry.set(expiry);
}

export async function getToken(url: URL) {
  // stored in the previous step
  const codeVerifier = sessionStorage.getItem('apiAuthCodeVerifier');
  if (!codeVerifier) {
    throw new Error('No OAuth2 code verifer set');
  }
  sessionStorage.removeItem('apiAuthCodeVerifier');

  const state = sessionStorage.getItem('apiAuthState');
  if (!state) {
    throw new Error('No OAuth2 state set');
  }
  sessionStorage.removeItem('apiAuthState');

  let response = await openid.authorizationCodeGrant(await config(), url, {
    pkceCodeVerifier: codeVerifier,
    expectedState: state
  });

  saveToken(response);
}

export async function refreshToken() {
  const refreshToken = get(apiTokenRefresh);
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  let response = await openid.refreshTokenGrant(await config(), refreshToken);

  saveToken(response);
}
