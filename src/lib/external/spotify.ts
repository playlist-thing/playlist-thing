import { get, writable } from 'svelte/store';

import { spotifyClientId, spotifyClientSecret } from '$lib/settings.ts';

import type { PlaylistItem } from '$lib/playlist.ts';

export const spotifyToken = writable('');

export function spotifyTrackIdFromUrl(url: string) {
  const pattern = /https:\/\/(open|play).spotify.com\/track\/([a-zA-Z0-9]+)/;
  const matches = url.match(pattern);
  if (matches === null || matches.length !== 3) return null;

  return matches[2];
}

export async function spotifyConnectFromSettings() {
  const clientId = get(spotifyClientId);
  const clientSecret = get(spotifyClientSecret);

  if (typeof clientId !== 'string' || clientId === '') {
    throw new Error('Invalid Spotify client ID');
  }

  if (typeof clientSecret !== 'string' || clientSecret === '') {
    throw new Error('Invalid Spotify client secret');
  }

  await spotifyConnect(clientId, clientSecret);
}

export async function spotifyConnect(clientId: string, clientSecret: string) {
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

export async function getSpotifyTrack(spotifyTrackId: string): Promise<PlaylistItem> {
  if (!get(spotifyToken)) {
    await spotifyConnectFromSettings();
  }

  const response = await fetch(`https://api.spotify.com/v1/tracks/${spotifyTrackId}`, {
    headers: {
      Authorization: `Bearer ${get(spotifyToken)}`
    }
  });

  if (!response.ok) {
    throw new Error('Spotify');
  }

  const json = await response.json();

  const artist = json.artists.map((x: any) => x.name).join(', ');
  const title = json.name;
  const album = json.album.name;
  const seconds = Math.ceil(json.duration_ms / 1000);
  const released = json.album.release_date;

  return {
    id: 0,
    seconds: seconds,
    notes: '',

    tag: 'Song',
    content: {
      artist,
      title,
      album,
      released,
      label: '',

      file: '',
      links: {
        'spotify.com': spotifyTrackId
      }
    }
  };
}
