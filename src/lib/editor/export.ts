import { fileSave } from 'browser-fs-access';
import slug from 'slug';

import type { Playlist } from '$lib/schema/playlist';

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
