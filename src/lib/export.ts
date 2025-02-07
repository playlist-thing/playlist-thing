import { fileSave } from 'browser-fs-access';
import slug from 'slug';

import type { PlaylistItem } from '$lib/playlist.ts';

export async function exportNotes(items: PlaylistItem[], name: string) {
  let output: string[] = [];

  for (const item of items) {
    if (item.tag === 'AirBreak') {
      output.push('--- AIR BREAK ---');
    } else {
      if (item.tag === 'AirBreakWithBackgroundMusic') {
        output.push('--- AIR BREAK WITH BACKGROUND MUSIC ---');
      }
      output.push(`Title: ${item.content.title}\n`);
      output.push(`Artist: ${item.content.artist}\n`);
      output.push(`Album: ${item.content.album}\n`);
      output.push(`Released: ${item.content.released}\n`);
    }

    output.push(`Notes:\n${item.notes}\n\n`);
  }

  const blob = new Blob(output);
  await fileSave(blob, {
    fileName: `${slug(name)}_notes.txt`
  });
}

export async function exportCollectionScript(items: PlaylistItem[], name: string) {
  let output: string[] = [];

  let i = 1;
  for (const item of items) {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      const orig = JSON.stringify(item.content.file);
      const number = `${i}`.padStart(2, '0');
      const newName = `${number} - ${item.content.artist} - ${item.content.title}.mp3`;
      output.push(`collect ${orig} "${newName}"\n`);
      i += 1;
    }
  }

  const blob = new Blob(output);
  await fileSave(blob, {
    fileName: `${slug(name)}_notes.txt`
  });
}
