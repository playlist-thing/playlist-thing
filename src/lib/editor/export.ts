import { fileSave } from 'browser-fs-access';
import slug from 'slug';

import type { Playlist } from '$lib/schema/playlist';
import type { PlaylistExport } from '$lib/schema/export/playlist';

export async function exportNotes(playlist: Playlist) {
  const output: string[] = [];

  for (const item of playlist.items) {
    if (item.tag === 'AirBreak') {
      output.push('--- AIR BREAK ---\n');
    } else {
      if (item.tag === 'AirBreakWithBackgroundMusic') {
        output.push('--- AIR BREAK WITH BACKGROUND MUSIC ---\n');
      }
      output.push(`Title: ${item.content.title}\n`);
      output.push(`Artist: ${item.content.artist}\n`);
      output.push(`Album: ${item.content.album}\n`);
      output.push(`Released: ${item.content.released}\n`);
    }

    output.push(`Internal Notes:\n${item.internalNotes}\n`);
    output.push(`Public Notes:\n${item.publicNotes}\n\n`);
  }

  const blob = new Blob(output);
  await fileSave(blob, {
    fileName: `${slug(playlist.name)}_notes.txt`
  });
}

export async function exportJson(playlist: Playlist) {
  const data: PlaylistExport = {
    ...playlist,

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    items: playlist.items.map(({ id, ...item }) => item),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    queue: playlist.queue.map(({ id, ...item }) => item)
  };

  const blob = new Blob([JSON.stringify(data)], {
    type: 'application/json'
  });

  await fileSave(blob, {
    fileName: slug(playlist.name)
  });
}
