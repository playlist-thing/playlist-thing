import { get, derived } from 'svelte/store';

import { fileSave } from 'browser-fs-access';

import localStorageStore from '$lib/localStorageStore.ts';

import { defaultSearchProviders } from '$lib/search.ts';

// settings

export const spotifyClientId = localStorageStore('spotifyClientId', '');
export const spotifyClientSecret = localStorageStore('spotifyClientSecret', '');

export const searchProviders = localStorageStore('searchProviders', defaultSearchProviders);
export const quickSearchProviderId = localStorageStore('quickSearchProviderId', 0);

// derived

export const quickSearchUrl = derived(
  [searchProviders, quickSearchProviderId],
  ([$searchProviders, $quickSearchProviderId]) => {
    if ($searchProviders.length > 0) {
      const result = $searchProviders.filter(
        (searchProvider: any) => searchProvider.id == $quickSearchProviderId
      );

      if (result.length === 1) {
        return result[0].url;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
);

export async function exportSettings() {
  const settings = {
    spotifyClientId: get(spotifyClientId),
    spotifyClientSecret: get(spotifyClientSecret),

    searchProviders: get(searchProviders),
    quickSearchProviderId: get(quickSearchProviderId)
  };

  const blob = new Blob([JSON.stringify(settings)], {
    type: 'application/json'
  });

  await fileSave(blob, {
    fileName: 'playlist-thing-settings.json'
  });
}

export async function importSettings(file: File) {
  const settings = JSON.parse(await file.text());

  spotifyClientId.set(settings.spotifyClientId);
  spotifyClientSecret.set(settings.spotifyClientSecret);

  searchProviders.set(settings.searchProviders);
  quickSearchProviderId.set(settings.quickSearchProviderId);
}
