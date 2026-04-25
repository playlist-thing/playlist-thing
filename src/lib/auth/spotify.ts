import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';

import * as openid from 'openid-client';

import localStorageStore from '$lib/localStorageStore.ts';

const scope = '';

export const spotifyToken = localStorageStore('spotifyToken', '');
export const spotifyTokenRefresh = localStorageStore('spotifyTokenRefresh', '');
export const spotifyTokenExpiry = localStorageStore('spotifyTokenExpiry', 0);

export function tokenNeedsRefresh() {
  if (Date.now() > get(spotifyTokenExpiry)) return true;

  return false;
}

async function config() {
  if (!env.PUBLIC_SPOTIFY_CLIENT_ID) {
    throw new Error('Spotify client ID missing');
  }

  return new openid.Configuration(
    {
      issuer: 'https://accounts.spotify.com',
      authorization_endpoint: 'https://accounts.spotify.com/authorize',
      token_endpoint: 'https://accounts.spotify.com/api/token'
    },
    env.PUBLIC_SPOTIFY_CLIENT_ID
  );
}

export async function redirectToSpotifyAuthorize() {
  const codeVerifier = openid.randomPKCECodeVerifier();
  const codeChallenge = openid.calculatePKCECodeChallenge(codeVerifier);

  sessionStorage.setItem('spotifyCodeVerifier', codeVerifier);

  const state = openid.randomState();

  sessionStorage.setItem('spotifyState', state);

  const authUrl = openid.buildAuthorizationUrl(await config(), {
    redirect_uri: `${location.origin}/oauth2/spotify/callback`,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: await codeChallenge,
    state
  });

  window.location.href = authUrl.toString();
}

function saveToken(response: openid.TokenEndpointResponse) {
  if (!response.refresh_token) {
    throw new Error('Response has no refresh_token');
  }

  if (!response.expires_in) {
    throw new Error('Response has no expires_in');
  }

  const expiry = Date.now() + response.expires_in * 1000;

  spotifyToken.set(response.access_token);
  spotifyTokenRefresh.set(response.refresh_token);
  spotifyTokenExpiry.set(expiry);
}

export async function getToken(url: URL) {
  // stored in the previous step
  const codeVerifier = sessionStorage.getItem('spotifyCodeVerifier');
  if (!codeVerifier) {
    throw new Error('No OAuth2 code verifer set');
  }
  sessionStorage.removeItem('spotifyCodeVerifier');

  const state = sessionStorage.getItem('spotifyState');
  if (!state) {
    throw new Error('No OAuth2 state set');
  }
  sessionStorage.removeItem('spotifyState');

  let response = await openid.authorizationCodeGrant(await config(), url, {
    pkceCodeVerifier: codeVerifier,
    expectedState: state
  });

  saveToken(response);
}

export async function refreshToken() {
  const refreshToken = get(spotifyTokenRefresh);
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  let response = await openid.refreshTokenGrant(await config(), refreshToken);

  saveToken(response);
}
