import { openDB } from 'idb';
import type { DBSchema } from 'idb';

import type { Playlist, Show, Station, DJ } from '$lib/playlist.ts';

interface DBv1 extends DBSchema {
  playlists: {
    key: string;
    value: Playlist;
    indexes: {
      slug: string;
      broadcastStart: number;
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

async function openDatabase() {
  const db = await openDB<DBv1>('playlist-thing', 1, {
    async upgrade(db, oldVersion) {
      const playlists = db.createObjectStore('playlists', {
        keyPath: 'id'
      });
      playlists.createIndex('slug', 'slug', { unique: false });
      playlists.createIndex('createdAt', 'createdAt', { unique: false });
      playlists.createIndex('lastModifiedAt', 'lastModifiedAt', { unique: false });
      playlists.createIndex('showId', 'showId', { unique: false });
      playlists.createIndex('djId', 'djIds', { unique: false, multiEntry: true });

      const shows = db.createObjectStore('shows', {
        keyPath: 'id'
      });
      shows.createIndex('slug', 'slug', { unique: true });
      shows.createIndex('stationId', 'stationId', { unique: false });
      shows.createIndex('djId', 'djIds', { unique: false, multiEntry: true });

      const stations = db.createObjectStore('stations', {
        keyPath: 'id'
      });
      stations.createIndex('slug', 'slug', { unique: true });
      stations.createIndex('djId', 'djIds', { unique: false, multiEntry: true });

      const djs = db.createObjectStore('djs', {
        keyPath: 'id'
      });
      djs.createIndex('slug', 'slug', { unique: true });
    }
  });
  return db;
}
