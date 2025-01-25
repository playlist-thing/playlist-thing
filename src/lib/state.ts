import { writable } from 'svelte/store';

/**
 * Storage of temporary state (not lasting beyond this browser tab/window)
 */

/** next id assigned to an item */
export const nextId = writable(0);
