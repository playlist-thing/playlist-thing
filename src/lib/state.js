import { get, writable } from 'svelte/store';

/**
 * Storage of temporary state (not lasting beyond this browser tab/window)
 */

/** next id assigned to an item */
export const nextId = writable(0);

let finishEditCallback;

/** null when edit modal is not shown, else currently edited item. Do
 * not set manually, instead use `startEdit` */
export const editItem = writable(null);

/** null when edit modal is not shown, else id of the playlist
 * containing the currently edited item */
export const editItemSource = writable(null);

/** start editing an item */
export function startEdit(item, itemSource, callback) {
  if (get(editItem)) {
    finishEditCallback(get(editItem));
  }

  editItem.set(item);
  editItemSource.set(itemSource);
  finishEditCallback = callback;
}

/** finish editing an item */
export function finishEdit() {
  if (get(editItem)) {
    finishEditCallback(get(editItem));
  }

  editItem.set(null);
}
