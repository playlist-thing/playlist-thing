import { get, derived } from 'svelte/store';

import { z } from 'zod';

import { fileSave } from 'browser-fs-access';

import localStorageStore from '$lib/localStorageStore';

import { defaultSearchProviders, SearchProviderSchema } from './search';

const SettingsSchema = z.object({
  airBreakDurationSeconds: z.number(),
  searchProviders: z.array(SearchProviderSchema),
  quickSearchProviderId: z.number()
});

type Settings = z.infer<typeof SettingsSchema>;

// settings

export const airBreakDurationSeconds = localStorageStore('airBreakDurationSeconds', 90);
export const searchProviders = localStorageStore('searchProviders', defaultSearchProviders);
export const quickSearchProviderId = localStorageStore('quickSearchProviderId', 0);

// derived

export const quickSearchUrl = derived(
  [searchProviders, quickSearchProviderId],
  ([$searchProviders, $quickSearchProviderId]) => {
    if ($searchProviders.length > 0) {
      const result = $searchProviders.filter(
        (searchProvider) => searchProvider.id == $quickSearchProviderId
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
  const settings: Settings = {
    airBreakDurationSeconds: get(airBreakDurationSeconds),
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
  const parsed = JSON.parse(await file.text());
  const result = SettingsSchema.safeParse(parsed);

  if (!result.success) {
    console.error(result.error);
    throw new Error('Failed to parse settings');
  }

  const settings = result.data;
  airBreakDurationSeconds.set(settings.airBreakDurationSeconds);
  searchProviders.set(settings.searchProviders);
  quickSearchProviderId.set(settings.quickSearchProviderId);
}
