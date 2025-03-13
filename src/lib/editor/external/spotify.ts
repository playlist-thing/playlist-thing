import { get } from 'svelte/store';

import { spotifyToken, tokenNeedsRefresh, refreshToken } from './auth/spotify.ts';

import type { PlaylistItem } from '$lib/playlist.ts';

export function spotifyTrackIdFromUrl(url: string) {
  const pattern = /https:\/\/(open|play).spotify.com\/track\/([a-zA-Z0-9]+)/;
  const matches = url.match(pattern);
  if (matches === null || matches.length !== 3) return null;

  return matches[2];
}

export function urlFromSpotifyTrackId(spotifyTrackId: string) {
  return `https://open.spotify.com/track/${spotifyTrackId}`;
}

export async function getSpotifyTrack(spotifyTrackId: string): Promise<PlaylistItem> {
  if (tokenNeedsRefresh()) {
    await refreshToken();
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

      attributes: {
        'spotify.com': spotifyTrackId
      }
    }
  };
}
