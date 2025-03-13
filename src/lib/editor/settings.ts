import { get, derived } from 'svelte/store';

import { fileSave } from 'browser-fs-access';

import localStorageStore from '$lib/localStorageStore.ts';

import { defaultSearchProviders } from './search.ts';

// settings

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

  searchProviders.set(settings.searchProviders);
  quickSearchProviderId.set(settings.quickSearchProviderId);
}
