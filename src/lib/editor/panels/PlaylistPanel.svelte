<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { fileSave } from 'browser-fs-access';
  import toSlug from 'slug';

  import List from './playlist/List.svelte';
  import ControlsTop from './playlist/ControlsTop.svelte';
  import Options from './playlist/Options.svelte';

  import type { PlaylistItem, Playlist, Broadcast } from '$lib/playlist.ts';
  import { emptySong, emptyAirBreak } from '$lib/playlist.ts';
  import { spotifyTrackIdFromUrl, getSpotifyTrack } from '$lib/editor/external/spotify.ts';
  import { spotifyToken } from '$lib/editor/external/auth/spotify.ts';
  import { getFile } from '$lib/editor/external/file.ts';
  import { withFreshIds, modals } from '$lib/editor/state.svelte.ts';
  import { exportNotes } from '$lib/editor/export.ts';

  interface Props {
    panelId: string;
  }

  let { panelId }: Props = $props();

  let name = $state('');
  let slug = $state('');
  let description = $state('');
  let isPublic = $state(false);
  let broadcast: Broadcast | null = $state(null);
  let createdAt = $state(0);
  let lastModifiedAt = $state(0);

  let items: PlaylistItem[] = $state([]);
  let queue: PlaylistItem[] = $state([]);

  let showId: string | null = $state(null);
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

  onMount(() => {
    loadLocalStorage();
    autosaveCallback = setTimeout(autosave, 1000);
  });
  onDestroy(() => {
    if (!browser) return;

    clearTimeout(autosaveCallback!);
    saveLocalStorage();
  });

  function saveLocalStorage() {
    localStorage.setItem(`playlist${panelId}`, toJson());
  }

  function loadLocalStorage() {
    const restoredPlaylist = localStorage.getItem(`playlist${panelId}`);
    if (restoredPlaylist !== null) {
      fromJson(restoredPlaylist);
    }
  }

  function autosave() {
    if (!autosaved) {
      saveLocalStorage();
      autosaved = true;
    }

    autosaveCallback = setTimeout(autosave, 1000);
  }

  function clear() {
    items = [];
    queue = [];
  }

  async function fromJson(json: string) {
    const parsed = JSON.parse(json);
    clear();

    ({
      name,
      slug,
      description,
      public: isPublic,
      broadcast,
      createdAt,
      lastModifiedAt,

      showId,
      djIds
    } = parsed);

    items = withFreshIds(parsed.items);
    queue = withFreshIds(parsed.queue);
  }

  function toJson() {
    const data: Omit<Playlist, 'id'> = {
      name,
      slug,
      description,
      public: isPublic,
      broadcast,
      createdAt,
      lastModifiedAt,

      items,
      queue,

      showId,
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
            Add empty song
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
  @import '$lib/style/forms.css';
  @import '$lib/style/panel.css';

  .outer-container {
    max-width: 800px;
  }

  .playlist-container {
    display: flex;
    flex-direction: column;

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

  .autosave-indicator {
    padding-right: 0.2em;

    -webkit-user-select: none; /* Safari */
    user-select: none;
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

  .controls-bottom-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
