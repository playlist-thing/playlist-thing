<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { fileSave } from 'browser-fs-access';
  import type { DndEvent } from 'svelte-dnd-action';
  import { dndzone, dragHandleZone } from 'svelte-dnd-action';
  import slug from 'slug';

  import EditPanel from './EditPanel.svelte';
  import ControlsTop from './playlist/ControlsTop.svelte';
  import ConfirmClear from './playlist/ConfirmClear.svelte';
  import Song from './playlist/Song.svelte';

  import type { PlaylistItem } from '$lib/playlist.ts';
  import { emptySong, emptyAirBreak } from '$lib/playlist.ts';
  import { spotifyTrackIdFromUrl, getSpotifyTrack } from '$lib/editor/external/spotify.ts';
  import { spotifyToken } from '$lib/editor/external/auth/spotify.ts';
  import { getFile } from '$lib/editor/external/file.ts';
  import { calculateTimeInfo, TimeInfoMode } from '$lib/timeInfo.ts';
  import { nextId, modals, displaySizeMedium } from '$lib/editor/state.svelte.ts';
  import { exportNotes } from '$lib/editor/export.ts';

  interface Props {
    panelId: string;
  }

  let { panelId }: Props = $props();

  let items: PlaylistItem[] = $state([]);
  let name = $state('');

  let autosaveCallback: number | null;
  let autosaved = $state(false);
  let showConfirmClear = $state(false);
  let editingItemIdx: number | null = $state(null);
  let timeInfoMode: TimeInfoMode = $state(TimeInfoMode.Duration);

  let timeInfo = $derived(calculateTimeInfo(items, timeInfoMode));
  let dndOptions = $derived({ items, dragDisabled: items.length === 0 });

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
      fromJson(restoredPlaylist, false);
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
    showConfirmClear = false;
  }

  async function fromJson(json: string, append: boolean) {
    const parsed = JSON.parse(json);

    // clear items
    if (!append) {
      items = [];
    }

    // if we are starting from scratch, also adopt name
    if (items.length === 0) {
      name = parsed.name;
    }

    await addItems(parsed.items);
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
    items = e.detail.items as PlaylistItem[];
  }

  function deleteItem(id: number) {
    if (editingItemIdx !== null && items[editingItemIdx].id === id) {
      editingItemIdx = null;
    }

    items = items.filter((item) => item.id !== id);
  }

  async function addItems(newItems: PlaylistItem[]) {
    const oldNextId = $nextId;
    for (let i = 0; i < newItems.length; i++) {
      newItems[i].id = oldNextId + i;
    }
    $nextId += newItems.length;

    items = [...items, ...newItems];

    await tick();
    playlistContainer.scrollTo(0, playlistContainer.scrollHeight);
  }

  async function addEmpty() {
    await addItems([emptySong]);
  }

  async function addPause() {
    await addItems([emptyAirBreak]);
  }

  async function addSpotifyTrack(spotifyTrackId: string) {
    if (!$spotifyToken) {
      modals.showSpotifyConnectModal = true;
      return;
    }

    try {
      const track = await getSpotifyTrack(spotifyTrackId);
      await addItems([track]);
    } catch (e) {
      console.log(e);
    }
  }

  async function addFile(file: File) {
    try {
      const track = await getFile(file);
      await addItems([track]);
    } catch (e) {
      modals.showAddFileErrorModal = true;
      console.log(e);
    }
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
      <div bind:this={playlistContainer} class="playlist-container">
        {#snippet playlistItems()}
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
        {/snippet}

        {#if displaySizeMedium.current}
          <div
            class="playlist"
            role="list"
            use:dndzone={dndOptions}
            onconsider={handleSort}
            onfinalize={handleSort}
          >
            {@render playlistItems()}
          </div>
        {:else}
          <div
            class="playlist"
            role="list"
            use:dragHandleZone={dndOptions}
            onconsider={handleSort}
            onfinalize={handleSort}
          >
            {@render playlistItems()}
          </div>
        {/if}

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

  .outer-container {
    max-width: 800px;
  }

  .playlist-container {
    display: flex;
    flex-direction: column;

    overflow: auto;
    position: relative;
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

  .autosave-indicator {
    color: #666;
  }
</style>
