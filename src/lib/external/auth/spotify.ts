import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';

import localStorageStore from '$lib/localStorageStore.ts';

const authorizationEndpoint = 'https://accounts.spotify.com/authorize';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';
const scope = '';

export const spotifyToken = localStorageStore('spotifyToken', '');
export const spotifyTokenRefresh = localStorageStore('spotifyTokenRefresh', '');
export const spotifyTokenExpiry = localStorageStore('spotifyTokenExpiry', 0);

export function tokenNeedsRefresh() {
  const now = new Date();
  if (now.getTime() > get(spotifyTokenExpiry)) return true;

  return false;
}

function generateRandomString(length: number) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function redirectToSpotifyAuthorize() {
  if (!env.PUBLIC_SPOTIFY_CLIENT_ID) {
    throw new Error('Spotify client ID missing');
  }

  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  localStorage.setItem('spotifyCodeVerifier', codeVerifier);

  const authUrl = new URL(authorizationEndpoint);
  const params = {
    response_type: 'code',
    client_id: env.PUBLIC_SPOTIFY_CLIENT_ID,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: `${location.origin}/oauth2/spotify/callback`
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString(); // Redirect the user to the authorization server for login
}

function saveToken(response: object) {
  if (!('access_token' in response && typeof response.access_token === 'string')) {
    throw new Error('Response has no access_token');
  }

  if (!('refresh_token' in response && typeof response.refresh_token === 'string')) {
    throw new Error('Response has no refresh_token');
  }

  if (!('expires_in' in response && typeof response.expires_in === 'number')) {
    throw new Error('Response has no expires_in');
  }

  const now = new Date();
  const expiry = now.getTime() + response.expires_in * 1000;

  spotifyToken.set(response.access_token);
  spotifyTokenRefresh.set(response.refresh_token);
  spotifyTokenExpiry.set(expiry);
}

export async function getToken(code: string) {
  if (!env.PUBLIC_SPOTIFY_CLIENT_ID) {
    throw new Error('Spotify client ID missing');
  }

  // stored in the previous step
  const codeVerifier = localStorage.getItem('spotifyCodeVerifier');
  if (!codeVerifier) {
    throw new Error('No OAuth2 code verifer set');
  }

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: env.PUBLIC_SPOTIFY_CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${location.origin}/oauth2/spotify/callback`,
      code_verifier: codeVerifier
    })
  };

  const body = await fetch(tokenEndpoint, payload);

  if (!body.ok) {
    const text = await body.text();
    throw new Error(`Spotify responded with error while getting token: ${text}`);
  }

  const response = await body.json();
  saveToken(response);
}

export async function refreshToken() {
  if (!env.PUBLIC_SPOTIFY_CLIENT_ID) {
    throw new Error('Spotify client ID missing');
  }

  const refreshToken = get(spotifyTokenRefresh);
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: env.PUBLIC_SPOTIFY_CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  };

  const body = await fetch(tokenEndpoint, payload);

  if (!body.ok) {
    const text = await body.text();
    throw new Error(`Spotify responded with error while getting token: ${text}`);
  }

  const response = await body.json();
  saveToken(response);
}
