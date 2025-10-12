import type { SongMetadata } from '$lib/playlist.ts';

export interface SearchProvider {
  id: number;
  name: string;
  url: string;
}

export const defaultSearchProviders: SearchProvider[] = [
  { id: 0, name: 'YouTube Music', url: 'https://music.youtube.com/search?q=' },
  { id: 1, name: 'Spotify', url: 'https://open.spotify.com/search/' },
  { id: 2, name: 'Apple Music', url: 'https://music.apple.com/search?term=' },
  { id: 3, name: 'Deezer', url: 'https://www.deezer.com/search/' },
  { id: 4, name: 'Google', url: 'https://www.google.com/search?q=' }
];

export function searchUrl(song: SongMetadata, searchUrl: string) {
  const searchTerm = `${song.title} ${song.artist}`;
  return searchUrl + encodeURIComponent(searchTerm);
}
