import { afterEach, expect, test } from 'vitest';
import 'fake-indexeddb/auto';
import { indexedDB } from 'fake-indexeddb';

import { DATABASE_NAME, openDatabase } from './db';
import { validDJ, validPlaylist, validShow, validStation } from './schema/examples.ts';

const playlist = {
  ...validPlaylist,
  showIds: [validShow.id],
  djIds: [validDJ.id]
};
const show = { ...validShow, stationId: validStation.id, djIds: [validDJ.id] };
const station = {
  ...validStation,
  links: [],
  djIds: [validDJ.id],
  domains: [
    {
      domain: 'example.com',
      verification: null
    }
  ]
};
const dj = validDJ;

let openedDb: Awaited<ReturnType<typeof openDatabase>> | undefined;

afterEach(async () => {
  const db = openedDb;
  db?.close();
  openedDb = undefined;

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME);

    request.onblocked = () => {
      db?.close();
    };
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
});

async function openTestDatabase() {
  openedDb = await openDatabase();
  return openedDb;
}

test('opens the database with the expected stores and indexes', async () => {
  const db = await openTestDatabase();

  expect(Array.from(db.objectStoreNames)).toEqual(
    expect.arrayContaining(['djs', 'playlists', 'shows', 'stations'])
  );
  expect(Array.from(db.objectStoreNames)).toHaveLength(4);

  const playlists = db.transaction('playlists', 'readonly').objectStore('playlists');
  expect(Array.from(playlists.indexNames)).toEqual(
    expect.arrayContaining(['slug', 'createdAt', 'lastModifiedAt', 'showId', 'djId'])
  );
  expect(Array.from(playlists.indexNames)).toHaveLength(5);
  expect(playlists.index('showId').multiEntry).toBe(true);
  expect(playlists.index('djId').multiEntry).toBe(true);

  const shows = db.transaction('shows', 'readonly').objectStore('shows');
  expect(Array.from(shows.indexNames)).toEqual(
    expect.arrayContaining(['slug', 'stationId', 'djId'])
  );
  expect(Array.from(shows.indexNames)).toHaveLength(3);
  expect(shows.index('djId').multiEntry).toBe(true);

  const stations = db.transaction('stations', 'readonly').objectStore('stations');
  expect(Array.from(stations.indexNames)).toEqual(expect.arrayContaining(['slug', 'djId']));
  expect(Array.from(stations.indexNames)).toHaveLength(2);
  expect(stations.index('djId').multiEntry).toBe(true);

  const djs = db.transaction('djs', 'readonly').objectStore('djs');
  expect(Array.from(djs.indexNames)).toEqual(['slug']);
});

test('persists records and supports indexed lookups', async () => {
  const db = await openTestDatabase();

  await db.put('djs', dj);
  await db.put('stations', station);
  await db.put('shows', show);
  await db.put('playlists', playlist);

  expect(await db.get('playlists', playlist.id)).toEqual(playlist);
  expect(await db.getFromIndex('playlists', 'showId', show.id)).toEqual(playlist);
  expect(await db.getFromIndex('playlists', 'djId', dj.id)).toEqual(playlist);
  expect(await db.getFromIndex('shows', 'stationId', station.id)).toEqual(show);
  expect(await db.getFromIndex('shows', 'djId', dj.id)).toEqual(show);
  expect(await db.getFromIndex('stations', 'djId', dj.id)).toEqual(station);
  expect(await db.getFromIndex('djs', 'slug', dj.slug)).toEqual(dj);
});
