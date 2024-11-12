import { writable } from 'svelte/store';

/**
 * Storage of temporary state (not lasting beyond this browser window)
 */

/** next id assigned to an item */
export const nextId = writable(0);

/** falsy when edit modal is not shown, else currently edited item */
export const editItem = writable(null);
