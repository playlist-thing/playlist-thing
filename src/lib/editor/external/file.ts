import { parseBlob } from 'music-metadata';

import type { SongDetails, SongMetadata } from '$lib/schema/playlist';

export async function fetchFileMetadata(file: File): Promise<SongDetails> {
  const metadata = await parseBlob(file, {
    duration: true,
    skipCovers: true
  });

  const seconds = Math.ceil(metadata.format.duration ? metadata.format.duration : 0);
  const artist = metadata.common.artist;
  const title = metadata.common.title;
  const album = metadata.common.album;

  const content: SongMetadata = {
    artist: artist ? artist : '',
    title: title ? title : file.name,
    album: album ? album : '',
    released: '',
    label: '',

    attributes: {
      file: file.name
    }
  };

  return { seconds, content };
}
