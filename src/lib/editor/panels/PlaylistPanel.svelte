<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { fileSave } from 'browser-fs-access';
  import toSlug from 'slug';

  import List from './playlist/List.svelte';
  import ControlsTop from './playlist/ControlsTop.svelte';
  import Options from './playlist/Options.svelte';

  import type { PlaylistItem, Broadcast, PlaylistStorage, Playlist } from '$lib/schema/playlist';
  import { PlaylistStorageSchema, emptySong, emptyAirBreak } from '$lib/schema/playlist';
  import { spotifyTrackIdFromUrl, getSpotifyTrack } from '$lib/editor/external/spotify';
  import { spotifyToken } from '$lib/auth/spotify';
  import { getFile } from '$lib/editor/external/file';
  import { withFreshIds, modals } from '$lib/editor/state.svelte';
  import { exportNotes } from '$lib/editor/export';
  import { openDatabase } from '$lib/db';

  interface Props {
    playlistId: string | null;
  }

  let { playlistId }: Props = $props();

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
  let showOptions = $state(false);

  let playlistContainer: HTMLElement;

  $effect(() => {
    // this makes us "track" all relevant information and call this
    // function again when anything inside the data touched by toJson
    // changes
    const _ = toJson();

    autosaved = false;
  });

  onMount(async () => {
    loadLocal();
    autosaveCallback = window.setTimeout(autosave, 1000);
  });
  onDestroy(async () => {
    if (!browser) return;

    window.clearTimeout(autosaveCallback!);
    saveLocal();
  });

  async function saveLocal() {
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

  async function addItemsToQueue(newItems: PlaylistItem[]) {
    newItems = withFreshIds(newItems);
    queue.push(...newItems);

    await tick();
    playlistContainer.scrollTo(0, playlistContainer.scrollHeight);
  }

  async function addEmpty() {
    await addItemsToQueue([emptySong]);
  }

  async function addPause() {
    await addItemsToQueue([emptyAirBreak]);
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

  async function addFile(file: File) {
    try {
      const track = await getFile(file);
      await addItemsToQueue([track]);
    } catch (e) {
      modals.showAddFileErrorModal = true;
      console.log(e);
    }
  }

  async function openPlaylistFile(file: File) {
    const json = await file.text();
    fromJson(json);
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

          if (file.name.endsWith('.json')) {
            await openPlaylistFile(file);
          } else {
            await addFile(file);
          }
        } else if (item.kind === 'string') {
          if (item.type === 'text/plain') {
            // when dragging from spotify, multiple lines in
            // text/plain gets mangled into one single line in
            // text/uri-list
            item.getAsString(async (lines) => {
              const split = lines.split('\n');
              for (const line of split) {
                const spotifyTrackId = spotifyTrackIdFromUrl(line);
                if (spotifyTrackId) {
                  await addSpotifyTrack(spotifyTrackId);
                } else {
                  modals.showURLInvalidModal = true;
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
    <ControlsTop bind:name bind:showOptions {autosaved} />
    {#if showOptions}
      <Options
        {clear}
        download={downloadJson}
        exportNotes={() => exportNotes(items, name)}
        close={() => (showOptions = false)}
      />
    {:else}
      <div bind:this={playlistContainer} class="playlist-container">
        <List name={'Playlist'} bind:items />
        <List name={'Queue'} bind:items={queue} />

        <div class="add-item-buttons">
          <button class="button" onclick={addEmpty}>
            <i class="bi bi-music-note" aria-hidden="true"></i>
            Add song
          </button>
          <button class="button" onclick={addPause}>
            <i class="bi bi-mic" aria-hidden="true"></i>
            Add air break
          </button>
        </div>

        <div></div>
      </div>

      <div class="controls-bottom">
        <!-- TODO aria role -->
        <div ondragover={dragoverHandler} ondrop={dropHandler} class="drop-zone">
          <i class="bi-plus-lg"></i>
          Drop new songs or playlists here
        </div>
      </div>
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

  .add-item-buttons {
    display: flex;

    padding: 6px;
  }

  .add-item-buttons > :not(:last-child) {
    margin-right: 4px;
  }

  .add-item-buttons > .button {
    width: 100%;
  }

  .controls-bottom {
    display: flex;
    flex-direction: column;
  }

  .drop-zone {
    padding: 1em;
    color: #666;

    -webkit-user-select: none; /* Safari */
    user-select: none;
  }
</style>
