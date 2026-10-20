import { openDB } from 'idb';
import type { DBSchema } from 'idb';

import type { PlaylistLocal } from '$lib/schema/local/playlist';
import type { Show } from '$lib/schema/show';
import type { Station } from '$lib/schema/station';
import type { DJ } from '$lib/schema/dj';
import { defaultBroadcastDurationMs } from '$lib/schema/playlist';

interface DBv1 extends DBSchema {
  playlists: {
    key: string;
    value: PlaylistLocal;
    indexes: {
      slug: string;
      createdAt: number;
      lastModifiedAt: number;
      showId: string;
      djId: string;
    };
  };
  shows: {
    key: string;
    value: Show;
    indexes: {
      slug: string;
      stationId: string;
      djId: string;
    };
  };
  stations: {
    key: string;
    value: Station;
    indexes: {
      slug: string;
      djId: string;
    };
  };
  djs: {
    key: string;
    value: DJ;
    indexes: {
      slug: string;
    };
  };
}

export const DATABASE_NAME = 'playlist-thing';
export const DATABASE_VERSION = 2;

export async function openDatabase() {
  const db = await openDB<DBv1>(DATABASE_NAME, DATABASE_VERSION, {
    async upgrade(db, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) {
        const playlists = db.createObjectStore('playlists', {
          keyPath: 'id'
        });
        playlists.createIndex('slug', 'slug', { unique: false });
        playlists.createIndex('createdAt', 'createdAt', { unique: false });
        playlists.createIndex('lastModifiedAt', 'lastModifiedAt', { unique: false });
        playlists.createIndex('showId', 'showIds', { unique: false, multiEntry: true });
        playlists.createIndex('djId', 'djIds', { unique: false, multiEntry: true });

        const shows = db.createObjectStore('shows', {
          keyPath: 'id'
        });
        shows.createIndex('slug', 'slug', { unique: false });
        shows.createIndex('stationId', 'stationIds', { unique: false, multiEntry: true });
        shows.createIndex('djId', 'djIds', { unique: false, multiEntry: true });

        const stations = db.createObjectStore('stations', {
          keyPath: 'id'
        });
        stations.createIndex('slug', 'slug', { unique: false });
        stations.createIndex('djId', 'djIds', { unique: false, multiEntry: true });

        const djs = db.createObjectStore('djs', {
          keyPath: 'id'
        });
        djs.createIndex('slug', 'slug', { unique: false });
      }

      if (oldVersion < 2) {
        // broadcast duration moved from each broadcast to the playlist
        // (playlist.broadcastDurationMs); backfill existing playlists.
        const playlists = transaction.objectStore('playlists');
        let cursor = await playlists.openCursor();

        while (cursor) {
          const playlist = cursor.value;

          if (playlist.broadcastDurationMs === undefined) {
            // broadcasts used to carry their own duration
            const legacyBroadcasts = playlist.broadcasts as
              { start: number; duration?: number }[] | undefined;

            // take the duration from the first broadcast that has one
            const legacyDuration = legacyBroadcasts?.find(
              (broadcast) => broadcast.duration !== undefined
            )?.duration;

            await cursor.update({
              ...playlist,
              broadcasts: legacyBroadcasts?.map(({ start }) => ({ start, stationId: null })) ?? [],
              broadcastDurationMs: legacyDuration ?? defaultBroadcastDurationMs
            });
          }

          cursor = await cursor.continue();
        }
      }
    }
  });
  return db;
}
