<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { fileSave } from 'browser-fs-access';
  import { parseBlob } from 'music-metadata';
  import type { DndEvent } from 'svelte-dnd-action';
  import { dndzone } from 'svelte-dnd-action';
  import slug from 'slug';

  import Song from '$lib/Song.svelte';
  import EditPanel from '$lib/panels/EditPanel.svelte';
  import ControlsTop from './playlist/ControlsTop.svelte';
  import ConfirmClear from './playlist/ConfirmClear.svelte';

  import Item from '$lib/Item.svelte.ts';
  import { spotifyTrackIdFromUrl, getSpotifyTrack } from '$lib/external/spotify.ts';
  import { calculateTimeInfo } from '$lib/timeInfo.ts';
  import { nextId } from '$lib/state.ts';
  import { exportNotes } from '$lib/export.ts';

  interface Props {
    id: number;
  }

  let { id }: Props = $props();

  let items: Item[] = $state([]);
  let name = $state('');

  let autosaveCallback: number | null;
  let autosaved = $state(false);
  let showConfirmClear = $state(false);
  let editingItemIdx: number | null = $state(null);
  let timeInfoMode = $state('duration');

  let timeInfo = $derived(calculateTimeInfo(items, timeInfoMode));
  let dndOptions = $derived({ items, dragDisabled: items.length === 0 });

  $effect(() => {
    modified(items, name);
  });

  onMount(loadLocalStorage);
  // onDestroy(saveLocalStorage);

  function saveLocalStorage() {
    localStorage.setItem(`playlist${id}`, toJson());
  }

  function loadLocalStorage() {
    const restoredPlaylist = localStorage.getItem(`playlist${id}`);
    if (restoredPlaylist !== null) {
      fromJson(restoredPlaylist, false);
    }
  }

  function autosave() {
    saveLocalStorage();
    autosaved = true;
    autosaveCallback = null;
  }

  function modified(items, name) {
    autosaved = false;

    // cancel callback if it exists
    if (autosaveCallback) cancelIdleCallback(autosaveCallback);

    // set a new idle callback
    autosaveCallback = requestIdleCallback(autosave);
  }

  function clear() {
    items = [];
    showConfirmClear = false;
  }

  function fromJson(json: string, append: boolean) {
    const parsed = JSON.parse(json);

    // clear items
    if (!append) {
      items = [];
    }

    // if we are starting from scratch, also adopt name
    if (items.length === 0) {
      name = parsed.name;
    }

    for (let item of parsed.items) {
      // TODO optimize
      addItem(new Item(item));
    }
  }

  function toJson() {
    const data = {
      name: name,
      items: items
    };

    return JSON.stringify(data);
  }

  async function downloadJson() {
    const blob = new Blob([toJson()], {
      type: 'application/json'
    });

    await fileSave(blob, {
      fileName: slug(name)
    });
  }

  function handleSort(e: CustomEvent<DndEvent>) {
    items = e.detail.items as Item[];
  }

  function deleteItem(id: number) {
    if (editingItemIdx !== null && items[editingItemIdx].id === id) {
      editingItemIdx = null;
    }

    items = items.filter((item) => item.id !== id);
  }

  function addItem(item: Item) {
    item.id = $nextId;
    $nextId += 1;
    items = [...items, item];
  }

  function addEmpty() {
    addItem(new Item());
  }

  function addPause() {
    addItem(new Item({ seconds: 90, pause: true }));
  }

  async function addSpotifyTrack(spotifyTrackId: string) {
    await getSpotifyTrack(spotifyTrackId)
      .then(addItem)
      .catch((error) => console.log(error));
  }

  async function addFile(file: File) {
    const metadata = await parseBlob(file, {
      duration: true,
      skipCovers: true
    });

    const seconds = Math.ceil(metadata.format.duration);
    const artist = metadata.common.artist;
    const title = metadata.common.title;
    const album = metadata.common.album;

    addItem(new Item({ artist, title, album, seconds, file: file.name }));
  }

  async function openPlaylistFile(file: File) {
    const json = await file.text();
    fromJson(json, true);
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
            openPlaylistFile(file);
          } else {
            addFile(file);
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
                }
              }
            });
          } else if (item.type === 'application/x.playlist-json') {
            item.getAsString((json) => fromJson(json, true));
          }
        }
      }
    }
  }
</script>

<div class="outer-container">
  <div class="inner-container">
    <ControlsTop {items} bind:name bind:timeInfoMode />

    {#if showConfirmClear}
      <ConfirmClear {clear} cancel={() => (showConfirmClear = false)} />
    {:else}
      <div class="playlist-container">
        <div
          class="playlist"
          role="list"
          use:dndzone={dndOptions}
          onconsider={handleSort}
          onfinalize={handleSort}
        >
          {#each items as item, idx (item.id)}
            <Song
              bind:item={items[idx]}
              editing={editingItemIdx === idx}
              timeInfo={timeInfo[idx]}
              deleteItem={() => deleteItem(item.id)}
              startEdit={() => (editingItemIdx = idx)}
              stopEdit={() => (editingItemIdx = null)}
            />
          {:else}
            <div class="empty-item">
              <i>Empty playlist</i>
            </div>
          {/each}
        </div>

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
      </div>

      <div class="controls-bottom">
        <!-- TODO aria role -->
        <div ondragover={dragoverHandler} ondrop={dropHandler} class="drop-zone">
          <i class="bi-plus-lg"></i>
          Drop new songs or playlists here
        </div>

        <div class="controls-bottom-buttons">
          <div class="button-group">
            <button
              class="button"
              class:disabled={items.length === 0}
              onclick={() => (showConfirmClear = true)}
              disabled={items.length === 0}
            >
              <i class="bi-trash" aria-hidden="true"></i> Clear
            </button>

            <button
              class="button"
              class:disabled={items.length === 0}
              onclick={downloadJson}
              disabled={items.length === 0}
            >
              <i class="bi-download" aria-hidden="true"></i> Download
            </button>
            <button
              class="button"
              class:disabled={items.length === 0}
              onclick={() => exportNotes(items, name)}
              disabled={items.length === 0}
            >
              <i class="bi-list-ul" aria-hidden="true"></i> Export Notes
            </button>
          </div>

          <div class="autosave-indicator">
            {#if autosaved}
              autosaved
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

{#if editingItemIdx !== null}
  <EditPanel bind:item={items[editingItemIdx]} close={() => (editingItemIdx = null)} />
{/if}

<style>
  @import '$lib/style/forms.css';
  @import '$lib/style/panel.css';

  .playlist-container {
    display: flex;
    flex-direction: column;

    overflow: auto;
  }

  .playlist {
    display: flex;
    flex-direction: column;
  }

  .empty-item {
    display: flex;
    flex-direction: row;
    justify-content: center;

    padding: 20px;

    color: #666;

    -webkit-user-select: none; /* Safari */
    user-select: none;
  }

  .button-group {
    padding-left: 0.2em;
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

  .drop-zone,
  .autosave-indicator {
    -webkit-user-select: none; /* Safari */
    user-select: none;
  }

  .autosave-indicator {
    padding-right: 0.2em;
  }

  .controls-bottom {
    display: flex;
    flex-direction: column;
  }

  .drop-zone {
    padding: 1em;
    color: #666;
  }

  .controls-bottom-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .autosave-indicator {
    color: #666;
  }
</style>
