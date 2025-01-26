import { writable } from 'svelte/store';

import { browser } from '$app/environment';

export default function localStorageStore<T>(key: string, defaultValue: T) {
  let initialValue = defaultValue;

  // TODO this might not be enough to protect against overwriting
  // already existing values with the default ones when server-side
  // rendering is active
  if (browser) {
    const initialLocalStorageValue = localStorage.getItem(key);
    if (initialLocalStorageValue !== null) {
      initialValue = JSON.parse(initialLocalStorageValue);
    }
  }

  const innerStore = writable(initialValue);

  function set(value: T) {
    // propagate value to innerStore, this will call subscribers in
    // this browsing context
    innerStore.set(value);

    // save value to localStarage, this will call subscribers in other
    // browsing contexts
    localStorage.setItem(key, JSON.stringify(value));
  }

  function subscribe(run: (value: T | null) => void) {
    // subscribe for changes in this browsing context
    //
    // this will already call run, so we don't have to do that
    const innerSubscription = innerStore.subscribe(run);

    // subscribe for changes in other browsing contexts
    const eventListener = (event: StorageEvent) => {
      if (event.key! === key) {
        // propagate value to innerStore, this will call subscribers
        // in this browsing context
        //
        // no need to call run ourselves
        innerStore.set(JSON.parse(event.newValue!));
      }
    };
    window.addEventListener('storage', eventListener);

    return () => {
      innerSubscription();

      window.removeEventListener('storage', eventListener);
    };
  }

  return { subscribe, set };
}
