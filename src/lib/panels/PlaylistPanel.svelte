<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { fileSave } from 'browser-fs-access';
  import { parseBlob } from 'music-metadata';
  import { dndzone } from 'svelte-dnd-action';
  import slug from 'slug';

  import Song from '$lib/Song.svelte';
  import EditPanel from '$lib/panels/EditPanel.svelte';
  import ControlsTop from './playlist/ControlsTop.svelte';
  import ConfirmClear from './playlist/ConfirmClear.svelte';

  import Item from '$lib/Item.js';
  import { getSpotifyTrack } from '$lib/spotify.ts';
  import { calculateTimeInfo } from '$lib/timeInfo.ts';
  import { nextId } from '$lib/state.ts';

  let { id } = $props();

  let items = $state([]);
  let playlistName = $state('');

  let autosaveCallback;
  let autosaved = $state(false);
  let showConfirmClear = $state(false);
  let editingItemIdx = $state(null);
  let timeInfoMode = $state('duration');

  let timeInfo = $derived(calculateTimeInfo(items, timeInfoMode));
  let dndOptions = $derived({ items, dragDisabled: items.length === 0 });

  $effect(() => {
    modified(items, playlistName);
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

  function modified(items, playlistName) {
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

  function fromJson(json, append) {
    const parsed = JSON.parse(json);

    // clear items
    if (!append) {
      items = [];
    }

    // if we are starting from scratch, also adopt name
    if (items.length === 0) {
      playlistName = parsed.name;
    }

    for (let item of parsed.tracks) {
      // TODO optimize
      addItem(new Item(item));
    }
  }

  function toJson() {
    const data = {
      name: playlistName,
      tracks: items
    };

    return JSON.stringify(data);
  }

  async function downloadJson() {
    const blob = new Blob([toJson()], {
      type: 'application/json'
    });

    await fileSave(blob, {
      fileName: slug(playlistName)
    });
  }

  async function exportNotes() {
    let output = [];

    for (const item of items) {
      output.push(`Title: ${item.title}\n`);
      output.push(`Artist: ${item.artist}\n`);
      output.push(`Album: ${item.album}\n`);
      output.push(`Released: ${item.released}\n`);
      output.push(`Notes:\n${item.notes}\n\n`);
    }

    const blob = new Blob(output);
    await fileSave(blob, {
      fileName: `${playlistName}_notes.txt`
    });
  }

  function handleSort(e) {
    items = e.detail.items;
  }

  function deleteItem(id) {
    if (editingItemIdx !== null && items[editingItemIdx].id === id) {
      editingItemIdx = null;
    }

    items = items.filter((item) => item.id !== id);
  }

  function addItem(item) {
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

  async function addSpotifyTrack(spotifyTrackId) {
    await getSpotifyTrack(spotifyTrackId)
      .then(addItem)
      .catch((error) => console.log(error));
  }

  async function addFile(file) {
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

  async function openPlaylistFile(file) {
    const json = await file.text();
    fromJson(json, true);
  }

  function dragoverHandler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy';
  }

  async function dropHandler(ev) {
    ev.preventDefault();

    if (ev.dataTransfer.items) {
      for (const item of ev.dataTransfer.items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();

          if (file.name.endsWith('.json')) {
            openPlaylistFile(file);
          } else {
            addFile(file);
          }
        } else if (item.kind === 'string') {
          const spotifyUrlPrefix = 'https://open.spotify.com/track/';

          if (item.type === 'text/plain') {
            // when dragging from spotify, multiple lines in
            // text/plain gets mangled into one single line in
            // text/uri-list
            item.getAsString(async (lines) => {
              lines.split('\n').forEach(async (line) => {
                if (line.startsWith(spotifyUrlPrefix)) {
                  const spotifyTrackId = line.substring(spotifyUrlPrefix.length);
                  await addSpotifyTrack(spotifyTrackId);
                }
              });
            });
          } else if (item.type === 'application/x.playlist-json') {
            item.getAsString(openPlaylistJson);
          }
        }
      }
    }
  }
</script>

<div class="outer-container">
  <div class="inner-container">
    <ControlsTop {items} bind:playlistName bind:timeInfoMode />

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
              onclick={() => (showConfirmClear = true)}
              disabled={items.length === 0}
            >
              <i class="bi-trash" aria-hidden="true"></i> Clear
            </button>

            <button class="button" onclick={downloadJson} disabled={items.length === 0}>
              <i class="bi-download" aria-hidden="true"></i> Download
            </button>
            <button class="button" onclick={exportNotes} disabled={items.length === 0}>
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
