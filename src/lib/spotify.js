import { get, writable } from 'svelte/store';

import { spotifyClientId, spotifyClientSecret } from '$lib/settings.js';

import Item from '$lib/Item.js';

export const spotifyToken = writable('');

export async function spotifyConnectFromSettings() {
  const clientId = get(spotifyClientId);
  const clientSecret = get(spotifyClientSecret);

  await spotifyConnect(clientId, clientSecret);
}

export async function spotifyConnect(clientId, clientSecret) {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  const response = await fetch(`https://accounts.spotify.com/api/token`, {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (!response.ok) {
    throw new Error('Spotify');
  }

  const json = await response.json();
  spotifyToken.set(json.access_token);
}

export async function getSpotifyTrack(spotifyTrackId) {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${spotifyTrackId}`, {
    headers: {
      Authorization: `Bearer ${get(spotifyToken)}`
    }
  });

  if (!response.ok) {
    throw new Error('Spotify');
  }

  const json = await response.json();

  const artist = json.artists.map((x) => x.name).join(', ');
  const title = json.name;
  const album = json.album.name;
  const seconds = Math.ceil(json.duration_ms / 1000);
  const released = json.album.release_date;

  return new Item({
    artist,
    title,
    album,
    seconds,
    released,
    spotifyTrackId
  });
}
