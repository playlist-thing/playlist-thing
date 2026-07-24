import { MediaQuery } from 'svelte/reactivity';
import type { PlaylistItem } from '$lib/schema/playlist';
import type { PlaylistItemStorage } from '$lib/schema/storage/playlist';

/**
 * Storage of temporary state (not lasting beyond this browser tab/window)
 */

/** next id assigned to an item */
let nextId = $state(0);

/** medium-sized display active */
export const displaySizeMedium = new MediaQuery('min-width: 768px', false);

/** active modals */
export const modals = $state({
  showURLInvalidModal: false,
  showSpotifyConnectModal: false,
  showAddFileErrorModal: false,
  showOpenPlaylistErrorModal: false
});

export function withFreshIds(items: PlaylistItemStorage[]) {
  let result: PlaylistItem[] = [];

  for (const item of items) {
    result.push({ ...item, id: nextId++ });
  }

  return result;
}
