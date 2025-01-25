import localStorageStore from '$lib/localStorageStore.ts';

export const spotifyClientId = localStorageStore('spotifyClientId');
export const spotifyClientSecret = localStorageStore('spotifyClientSecret');

export const searchProviders = localStorageStore('extraSearchProviders');
