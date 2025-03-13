import { parseBlob } from 'music-metadata';

import type { PlaylistItem } from '$lib/playlist.ts';

export async function getFile(file: File): Promise<PlaylistItem> {
  const metadata = await parseBlob(file, {
    duration: true,
    skipCovers: true
  });

  const seconds = Math.ceil(metadata.format.duration ? metadata.format.duration : 0);
  const artist = metadata.common.artist;
  const title = metadata.common.title;
  const album = metadata.common.album;

  return {
    id: 0,
    seconds: seconds,
    notes: '',

    tag: 'Song',
    content: {
      artist: artist ? artist : '',
      title: title ? title : file.name,
      album: album ? album : '',
      released: '',
      label: '',

      attributes: {
        file: file.name
      }
    }
  };
}
