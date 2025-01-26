import { derived } from 'svelte/store';

import localStorageStore from '$lib/localStorageStore.ts';

import { defaultSearchProviders } from '$lib/search.ts';

export const spotifyClientId = localStorageStore('spotifyClientId', '');
export const spotifyClientSecret = localStorageStore('spotifyClientSecret', '');

export const searchProviders = localStorageStore('searchProviders', defaultSearchProviders);
export const quickSearchProviderId = localStorageStore('quickSearchProviderId', 0);
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
