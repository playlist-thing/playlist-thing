<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { fileSave } from 'browser-fs-access';
  import toSlug from 'slug';
  import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
  import { Debounced, watch } from 'runed';

  import List from './playlist/List.svelte';
  import ControlsTop from './playlist/ControlsTop.svelte';
  import Options from './playlist/Options.svelte';
  import AddItemControls from './playlist/AddItemControls.svelte';

  import type { PlaylistItem, Broadcast, Playlist } from '$lib/schema/playlist';
  import {
    emptySong,
    emptyAirBreak,
    emptySongMetadata,
    applySongDetails
  } from '$lib/schema/playlist';
  import type { SongDetails, SongWithDetails } from '$lib/schema/playlist';
  import {
    PlaylistExportSchema,
    type PlaylistItemExport,
    type PlaylistExport
  } from '$lib/schema/export/playlist';
  import { spotifyTrackIdFromUrl, fetchSpotifyMetadata } from '$lib/editor/external/spotify';
  import { spotifyToken } from '$lib/auth/spotify';
  import { fetchFileMetadata } from '$lib/editor/external/file';
  import { withFreshIds, modals } from '$lib/editor/state.svelte';
  import { exportNotes } from '$lib/editor/export';
  import { airBreakDurationSeconds } from '$lib/editor/settings';
  import { openDatabase } from '$lib/db';

  interface Props {
    playlistId: string | null;
  }

  let { playlistId = $bindable() }: Props = $props();

  let name = $state('');
  let slug = $state('');
  let description = $state('');
  let isPublic = $state(false);
  let broadcasts: Broadcast[] = $state([]);
  let createdAt = $state(0);
  let lastModifiedAt = $state(0);

  let items: PlaylistItem[] = $state([]);
  let queue: PlaylistItem[] = $state([]);

  let showIds: string[] = $state([]);
  let djIds: string[] = $state([]);

  let justLoaded = true;
  let showOptions = $state(false);

  let playlistContainer: HTMLElement | undefined = $state();

  type PlaylistSnapshot = Omit<Playlist, 'lastModifiedAt'>;

  function snapshot() {
    const playlistSnapshot: PlaylistSnapshot = {
      id: playlistId!,

      name: $state.snapshot(name),
      slug: $state.snapshot(slug),
      description: $state.snapshot(description),
      public: $state.snapshot(isPublic),
      broadcasts: $state.snapshot(broadcasts),
      createdAt: $state.snapshot(createdAt),

      items: $state.snapshot(items),
      queue: $state.snapshot(queue),

      showIds: $state.snapshot(showIds),
      djIds: $state.snapshot(djIds)
    };

    return playlistSnapshot;
  }

  const debouncedSnapshot = new Debounced(() => snapshot(), 1000);

  watch(
    () => debouncedSnapshot.current,
    (playlistSnapshot) => {
      // don't save when playlist was just loaded from db (and thus modified)
      if (justLoaded) {
        justLoaded = false;
        return;
      }

      // don't save when currently in a drag and drop operation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (playlistSnapshot.items.some((item) => (item as any)[SHADOW_ITEM_MARKER_PROPERTY_NAME]))
        return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (playlistSnapshot.queue.some((item) => (item as any)[SHADOW_ITEM_MARKER_PROPERTY_NAME]))
        return;

      lastModifiedAt = Date.now();

      saveLocal({
        ...$state.snapshot(playlistSnapshot),
        lastModifiedAt: $state.snapshot(lastModifiedAt)
      });
    }
  );

  onMount(async () => {
    await loadLocal();
  });
  onDestroy(async () => {
    if (!browser) return;

    await debouncedSnapshot.updateImmediately();
  });

  async function saveLocal(playlist: Playlist) {
    const db = await openDatabase();

    await db.put('playlists', playlist);
  }

  async function loadLocal() {
    const db = await openDatabase();

    const playlist = await db.get('playlists', playlistId!);

    if (playlist === undefined) {
      console.error(`playlist with ${playlistId} does not exist`);
      playlistId = null;
      return;
    }

    ({
      name,
      slug,
      description,
      public: isPublic,
      broadcasts,
      createdAt,
      lastModifiedAt,

      showIds,
      djIds
    } = playlist);

    items = withFreshIds(playlist.items);
    queue = withFreshIds(playlist.queue);

    justLoaded = true;
  }

  function toJson() {
    const data: PlaylistExport = {
      name,
      slug,
      description,
      public: isPublic,
      broadcasts,
      createdAt,
      lastModifiedAt,

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      items: items.map(({ id, ...item }) => item),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      queue: queue.map(({ id, ...item }) => item),

      showIds,
      djIds
    };

    return JSON.stringify(data);
  }

  async function downloadJson() {
    const blob = new Blob([toJson()], {
      type: 'application/json'
    });

    await fileSave(blob, {
      fileName: toSlug(name)
    });
  }

  async function closePlaylist() {
    await debouncedSnapshot.updateImmediately();
    playlistId = null;
  }

  async function deletePlaylist() {
    const db = await openDatabase();

    await db.delete('playlists', playlistId!);

    playlistId = null;
  }

  async function addItemsToQueue(newItems: PlaylistItemExport[]) {
    const added = withFreshIds(newItems);
    queue.push(...added);

    await tick();
    playlistContainer!.scrollTo(0, playlistContainer!.scrollHeight);

    // return the proxied items that live in the queue, so later in-place
    // mutations (e.g. filling in metadata) trigger reactivity
    return queue.slice(-added.length) as PlaylistItem[];
  }

  async function fillFromProvider(
    item: SongWithDetails,
    provider: () => Promise<SongDetails>,
    onError?: () => void
  ) {
    try {
      applySongDetails(item, await provider());
    } catch (e) {
      console.log(e);
      onError?.();
    }
  }

  async function addEmpty() {
    await addItemsToQueue([emptySong]);
  }

  async function addAirBreak() {
    const airBreak = { ...emptyAirBreak, seconds: $airBreakDurationSeconds };
    await addItemsToQueue([airBreak]);
  }

  async function addSpotifyTrack(spotifyTrackId: string) {
    if (!$spotifyToken) {
      modals.showSpotifyConnectModal = true;
      return;
    }

    const song = {
      ...emptySong,
      content: { ...emptySongMetadata, attributes: { 'spotify.com': spotifyTrackId } }
    };

    const [track] = await addItemsToQueue([song]);
    await fillFromProvider(track as SongWithDetails, () => fetchSpotifyMetadata(spotifyTrackId));
  }

  async function addSongFile(file: File) {
    const song = {
      ...emptySong,
      content: { ...emptySongMetadata, title: file.name, attributes: { file: file.name } }
    };

    const [track] = await addItemsToQueue([song]);
    await fillFromProvider(
      track as SongWithDetails,
      () => fetchFileMetadata(file),
      () => {
        queue = queue.filter((queuedItem) => queuedItem.id !== track.id);
        modals.showAddFileErrorModal = true;
      }
    );
  }

  async function addPlaylistFile(file: File) {
    const json = await file.text();
    let parsed;

    try {
      parsed = JSON.parse(json);
    } catch (e) {
      modals.showAddFileErrorModal = true;
      console.log(e);
      return;
    }

    const result = PlaylistExportSchema.safeParse(parsed);
    if (!result.success) {
      modals.showAddFileErrorModal = true;
      console.log(result.error);
      return;
    }

    const playlist = result.data;
    await addItemsToQueue(playlist.items);
    await addItemsToQueue(playlist.queue);
  }

  async function addFile(file: File) {
    if (file.name.endsWith('.json')) {
      await addPlaylistFile(file);
    } else {
      await addSongFile(file);
    }
  }

  async function addUrl(url: string) {
    const spotifyTrackId = spotifyTrackIdFromUrl(url);
    if (spotifyTrackId) {
      await addSpotifyTrack(spotifyTrackId);
      return;
    }

    throw new Error('URL not recognized');
  }

  function dragoverHandler(ev: DragEvent) {
    ev.preventDefault();
    ev.dataTransfer!.dropEffect = 'copy';
  }

  async function dropHandler(ev: DragEvent) {
    ev.preventDefault();

    const dataTransferItems = ev.dataTransfer!.items;
    if (dataTransferItems) {
      for (const item of dataTransferItems) {
        if (item.kind === 'file') {
          const file = item.getAsFile()!;
          await addFile(file);
        } else if (item.kind === 'string') {
          if (item.type === 'text/plain') {
            // when dragging from spotify, multiple lines in
            // text/plain gets mangled into one single line in
            // text/uri-list
            item.getAsString(async (lines) => {
              const split = lines.split('\n');
              for (const line of split) {
                try {
                  await addUrl(line);
                } catch (e) {
                  modals.showURLInvalidModal = true;
                  console.log(e);
                }
              }
            });
          } else if (item.type === 'application/x.playlist-json') {
            item.getAsString((json) => addItemsToQueue(JSON.parse(json)));
          }
        }
      }
    }
  }
</script>

<div class="outer-container">
  <div class="inner-container">
    <ControlsTop bind:name bind:showOptions {closePlaylist} />
    {#if showOptions}
      <Options
        bind:name
        bind:description
        bind:isPublic
        {deletePlaylist}
        download={downloadJson}
        exportNotes={() => exportNotes(items, name)}
        close={() => (showOptions = false)}
      />
    {:else}
      <div bind:this={playlistContainer} class="playlist-container">
        <List name="Playlist" bind:items />

        <div role="list" ondragover={dragoverHandler} ondrop={dropHandler}>
          <List name="Queue" bind:items={queue} />
          <AddItemControls {addEmpty} {addAirBreak} {addUrl} {addFile} />
        </div>
      </div>

      <div class="controls-bottom"></div>
    {/if}
  </div>
</div>

<style>
  .outer-container {
    max-width: 800px;
  }

  .playlist-container {
    display: flex;
    flex-direction: column;
    flex: 1;

    overflow: auto;
    position: relative;
  }

  .controls-bottom {
    display: flex;
    flex-direction: column;
  }
</style>
