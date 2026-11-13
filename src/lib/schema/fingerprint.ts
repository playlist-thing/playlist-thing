import type { Playlist, PlaylistItem } from './playlist';

function compareStrings(a: string, b: string) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function stripItemId(item: PlaylistItem): Omit<PlaylistItem, 'id'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = item;
  return rest;
}

/**
 * Stable JSON: object keys are sorted recursively so that logically identical
 * objects produce identical output regardless of key insertion order (e.g.
 * the `attributes` record of song metadata). Array order is preserved.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      compareStrings(a, b)
    )) {
      result[key] = canonicalize(entry);
    }

    return result;
  }

  return value;
}

function normalize(playlist: Playlist) {
  return {
    name: playlist.name,
    slug: playlist.slug,
    description: playlist.description,
    public: playlist.public,

    broadcasts: playlist.broadcasts
      .map((broadcast) => ({ start: broadcast.start, stationId: broadcast.stationId }))
      .sort((a, b) => a.start - b.start || compareStrings(a.stationId ?? '', b.stationId ?? '')),

    broadcastDurationMs: playlist.broadcastDurationMs,

    items: playlist.items.map(stripItemId),
    queue: playlist.queue.map(stripItemId),

    showIds: [...playlist.showIds].sort(compareStrings),
    djIds: [...playlist.djIds].sort(compareStrings)
  };
}

/**
 * A deterministic SHA-256 fingerprint of a playlist's syncable content.
 *
 * Local and remote can compute this over their own copy and compare the
 * results to check whether they are in sync. It is a pure function of the
 * content: local-only fields, per-session item ids and the ordering of
 * set-like collections (showIds, djIds, broadcasts) do not affect it.
 */
export async function playlistFingerprint(playlist: Playlist): Promise<string> {
  const json = JSON.stringify(canonicalize(normalize(playlist)));
  const bytes = new TextEncoder().encode(json);
  const digest = await crypto.subtle.digest('SHA-256', bytes);

  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
