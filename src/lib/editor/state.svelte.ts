import { writable } from 'svelte/store';
import { MediaQuery } from 'svelte/reactivity';

/**
 * Storage of temporary state (not lasting beyond this browser tab/window)
 */

/** next id assigned to an item */
export const nextId = writable(0);

/** medium-sized display active */
export const displaySizeMedium = new MediaQuery('min-width: 768px', false);

/** active modals */
export const modals = $state({
  showURLInvalidModal: false,
  showSpotifyConnectModal: false,
  showAddFileErrorModal: false
});
