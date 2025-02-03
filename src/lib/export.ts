import { fileSave } from 'browser-fs-access';
import slug from 'slug';

import Item from '$lib/Item.svelte.ts';

export async function exportNotes(items: Item[], name: string) {
  let output: string[] = [];

  for (const item of items) {
    output.push(`Title: ${item.title}\n`);
    output.push(`Artist: ${item.artist}\n`);
    output.push(`Album: ${item.album}\n`);
    output.push(`Released: ${item.released}\n`);
    output.push(`Notes:\n${item.notes}\n\n`);
  }

  const blob = new Blob(output);
  await fileSave(blob, {
    fileName: `${slug(name)}_notes.txt`
  });
}

export async function exportCollectionScript(items: Item[], name: string) {
  let output: string[] = [];

  let i = 1;
  for (const item of items) {
    const orig = JSON.stringify(item.file);
    const number = `${i}`.padStart(2, '0');
    const newName = `${number} - ${item.artist} - ${item.title}.mp3`;
    output.push(`collect ${orig} "${newName}"\n`);
    i += 1;
  }

  const blob = new Blob(output);
  await fileSave(blob, {
    fileName: `${slug(name)}_notes.txt`
  });
}
