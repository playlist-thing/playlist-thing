import { expect, test } from 'vitest';
import { searchUrl } from './search.ts';
import type { SongMetadata } from '$lib/playlist.ts';

const cloudbusting: SongMetadata = {
  title: 'Cloudbusting',
  artist: 'Kate Bush',
  album: 'Hounds of Love',
  released: '1985',
  label: 'EMI',

  attributes: {}
};

const insomnia: SongMetadata = {
  title: 'Insomnia',
  artist: 'Eli & Fur',
  album: 'Dreamscapes',
  released: '2024',
  label: '[PIAS]',

  attributes: {}
};

test('searchUrl', () => {
  expect(searchUrl(cloudbusting, 'https://music.youtube.com/search?q=')).toEqual(
    'https://music.youtube.com/search?q=Cloudbusting%20Kate%20Bush'
  );
  expect(searchUrl(insomnia, 'https://music.youtube.com/search?q=')).toEqual(
    'https://music.youtube.com/search?q=Insomnia%20Eli%20%26%20Fur'
  );
});
