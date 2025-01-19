<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { fileSave } from 'browser-fs-access';
  import { parseBlob } from 'music-metadata';
  import { dndzone } from 'svelte-dnd-action';

  import Song from '$lib/Song.svelte';
  import EditPanel from '$lib/panels/EditPanel.svelte';
  import ControlsTop from './playlist/ControlsTop.svelte';
  import ConfirmClear from './playlist/ConfirmClear.svelte';

  import Item from '$lib/Item.js';
  import { getSpotifyTrack } from '$lib/spotify.js';
  import { calculateTimeInfo } from '$lib/timeInfo.js';
  import { nextId } from '$lib/state.js';

  export let id;

  let items = [];
  let playlistName = '';

  let autosaveCallback;
  let autosaved = false;
  let showConfirmClear = false;
  let editingItemIdx = null;
  let timeInfoMode = 'duration';

  $: timeInfo = calculateTimeInfo(items, timeInfoMode);

  $: browser && modified(items, playlistName);

  onMount(loadLocalStorage);
  // onDestroy(saveLocalStorage);

  function saveLocalStorage() {
    localStorage.setItem(`playlist${id}`, JSON.stringify(items));
    localStorage.setItem(`playlistName${id}`, playlistName);
  }

  function loadLocalStorage() {
    const restoredPlaylist = localStorage.getItem(`playlist${id}`);
    if (restoredPlaylist) openPlaylistJson(restoredPlaylist);

    const restoredPlaylistName = localStorage.getItem(`playlistName${id}`);
    if (restoredPlaylistName) playlistName = restoredPlaylistName;
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

  async function downloadJson() {
    const blob = new Blob([JSON.stringify(items)], {
      type: 'application/json'
    });

    await fileSave(blob, {
      fileName: playlistName
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

  function deleteHandler(event) {
    const id = event.detail;

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

  function addDunno() {
    addItem(new Item({ title: 'DUNNO' }));
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

  function openPlaylistJson(text) {
    const parsed = JSON.parse(text);
    for (let item of parsed) {
      // TODO optimize
      addItem(new Item(item));
    }
  }

  async function openPlaylistFile(file) {
    const text = await file.text();
    openPlaylistJson(text);
    playlistName = file.name;
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
      <ConfirmClear on:clear={clear} on:cancel={() => (showConfirmClear = false)} />
    {:else}
      <div class="playlist-container">
        <div
          class="playlist"
          class:padding={items.length === 0}
          use:dndzone={{ items }}
          on:consider={handleSort}
          on:finalize={handleSort}
        >
          {#each items as item, idx (item.id)}
            <Song
              bind:item
              editing={editingItemIdx === idx}
              timeInfo={timeInfo[idx]}
              on:delete={deleteHandler}
              on:edit={() => (editingItemIdx = idx)}
              on:stopedit={() => (editingItemIdx = null)}
            />
          {/each}
        </div>
      </div>

      <div class="controls-bottom">
        <!-- TODO aria role -->
        <div on:dragover={dragoverHandler} on:drop={dropHandler} class="drop-zone">
          Drop new songs or playlists here
        </div>

        <div class="controls-bottom-buttons">
          <div class="button-group">
            <button class="button" on:click={addDunno}>Add dunno</button>
            <button class="button" on:click={addPause}>Add pause</button>

            <button
              class="button"
              on:click={() => (showConfirmClear = true)}
              disabled={items.length === 0}
            >
              <i class="bi-trash" /> Clear
            </button>

            <button class="button" on:click={downloadJson} disabled={items.length === 0}>
              <i class="bi-download" /> Download
            </button>
            <button class="button" on:click={exportNotes} disabled={items.length === 0}>
              <i class="bi-list-ul" /> Export Notes
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
  <EditPanel bind:item={items[editingItemIdx]} on:close={() => (editingItemIdx = null)} />
{/if}

<style>
  @import '$lib/style/forms.css';
  @import '$lib/style/panel.css';

  .playlist-container {
    overflow: auto;
  }

  .playlist {
    display: flex;
    flex-direction: column;
  }

  .playlist.padding {
    padding-bottom: 20px;
  }

  .button-group {
    padding-left: 0.2em;
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
