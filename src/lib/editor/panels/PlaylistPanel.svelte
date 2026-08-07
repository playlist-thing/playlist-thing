<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { fileSave } from 'browser-fs-access';
  import toSlug from 'slug';
  import { SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';

  import List from './playlist/List.svelte';
  import ControlsTop from './playlist/ControlsTop.svelte';
  import Options from './playlist/Options.svelte';
  import AddItemControls from './playlist/AddItemControls.svelte';

  import type { PlaylistItem, Broadcast, Playlist } from '$lib/schema/playlist';
  import { emptySong, emptyAirBreak } from '$lib/schema/playlist';
  import { PlaylistStorageSchema, type PlaylistStorage } from '$lib/schema/storage/playlist';
  import { spotifyTrackIdFromUrl, getSpotifyTrack } from '$lib/editor/external/spotify';
  import { spotifyToken } from '$lib/auth/spotify';
  import { getFile } from '$lib/editor/external/file';
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

  let autosaveCallback: number | null;
  let autosaved = $state(false);
  let justLoaded = false;
  let showOptions = $state(false);

  let playlistContainer: HTMLElement | undefined = $state();

  $effect(() => {
    // this makes us "track" all relevant information and call this
    // function again when anything inside the data touched by toJson
    // changes
    const _ = toJson();

    // don't save when playlist was just loaded from db (and thus modified)
    if (justLoaded) {
      autosaved = true;
      justLoaded = false;
      return;
    }

    // don't save when currently in a drag and drop operation
    if (items.some((item) => (item as any)[SHADOW_ITEM_MARKER_PROPERTY_NAME])) return;
    if (queue.some((item) => (item as any)[SHADOW_ITEM_MARKER_PROPERTY_NAME])) return;

    lastModifiedAt = Date.now();
    autosaved = false;
  });

  onMount(async () => {
    await loadLocal();
    autosaveCallback = window.setTimeout(autosave, 1000);
  });
  onDestroy(async () => {
    if (!browser) return;

    window.clearTimeout(autosaveCallback!);
    await saveLocal();
  });

  async function saveLocal() {
    if (playlistId === null) {
      return;
    }

    const db = await openDatabase();

    const playlist: Playlist = {
      id: playlistId!,

      name: $state.snapshot(name),
      slug: $state.snapshot(slug),
      description: $state.snapshot(description),
      public: $state.snapshot(isPublic),
      broadcasts: $state.snapshot(broadcasts),
      createdAt: $state.snapshot(createdAt),
      lastModifiedAt: $state.snapshot(lastModifiedAt),

      items: $state.snapshot(items),
      queue: $state.snapshot(queue),

      showIds: $state.snapshot(showIds),
      djIds: $state.snapshot(djIds)
    };
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

  async function autosave() {
    if (!autosaved) {
      await saveLocal();
      autosaved = true;
    }

    autosaveCallback = window.setTimeout(autosave, 1000);
  }

  function clear() {
    items = [];
    queue = [];
  }

  function fromJson(json: string) {
    let parsed;

    try {
      parsed = JSON.parse(json);
    } catch (e) {
      modals.showAddFileErrorModal = true;
      console.log(e);
      return;
    }

    const result = PlaylistStorageSchema.safeParse(parsed);
    if (!result.success) {
      modals.showAddFileErrorModal = true;
      console.log(result.error);
      return;
    }

    const playlist = result.data;
    clear();

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
  }

  function toJson() {
    const data: PlaylistStorage = {
      name,
      slug,
      description,
      public: isPublic,
      broadcasts,
      createdAt,
      lastModifiedAt,

      items: items.map(({ id, ...item }) => item),
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
    await saveLocal();
    playlistId = null;
  }

  async function deletePlaylist() {
    const db = await openDatabase();

    await db.delete('playlists', playlistId!);

    playlistId = null;
  }

  async function addItemsToQueue(newItems: PlaylistItem[]) {
    newItems = withFreshIds(newItems);
    queue.push(...newItems);

    await tick();
    playlistContainer!.scrollTo(0, playlistContainer!.scrollHeight);
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

    try {
      const track = await getSpotifyTrack(spotifyTrackId);
      await addItemsToQueue([track]);
    } catch (e) {
      console.log(e);
    }
  }

  async function addSongFile(file: File) {
    try {
      const track = await getFile(file);
      await addItemsToQueue([track]);
    } catch (e) {
      modals.showAddFileErrorModal = true;
      console.log(e);
    }
  }

  async function addPlaylistFile(file: File) {
    const json = await file.text();
    fromJson(json);
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
    <ControlsTop bind:name bind:showOptions {autosaved} {closePlaylist} />
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
        <List name={'Playlist'} bind:items />

        <div role="list" ondragover={dragoverHandler} ondrop={dropHandler}>
          <List name={'Queue'} bind:items={queue} />
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
