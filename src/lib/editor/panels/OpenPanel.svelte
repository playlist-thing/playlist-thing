<script lang="ts">
  import { v4 as uuidv4 } from 'uuid';

  import { openDatabase } from '$lib/db';
  import { emptyPlaylist, type Playlist } from '$lib/schema/playlist';
  import { PlaylistStorageSchema } from '$lib/schema/storage/playlist';
  import { onMount } from 'svelte';
  import { modals, withFreshIds } from '../state.svelte';
  import PlaylistListItem from './open/PlaylistListItem.svelte';

  interface Props {
    openPlaylist: (playlistId: string) => void;
    currentlyOpenPlaylistIds: (string | null | undefined)[];
  }

  let { openPlaylist, currentlyOpenPlaylistIds }: Props = $props();

  let files: FileList | undefined = $state();

  let localPlaylists: Promise<Playlist[]> = $state(new Promise(() => {}));

  let componentId = $props.id();

  $effect(() => {
    if (files !== undefined && files.length === 1) {
      openPlaylistFile(files[0]);
    }
  });

  async function loadLocalPlaylists() {
    const db = await openDatabase();
    const index = db.transaction('playlists').store.index('lastModifiedAt');

    const result = [];
    for await (const item of index.iterate(null, 'prev')) {
      result.push(item.value);
    }
    return result;
  }

  onMount(() => {
    localPlaylists = loadLocalPlaylists();
  });

  async function openNewPlaylist() {
    const db = await openDatabase();

    const newPlaylistId = uuidv4();
    const now = Date.now();
    await db.add('playlists', {
      ...emptyPlaylist,
      id: newPlaylistId,
      createdAt: now,
      lastModifiedAt: now
    });

    openPlaylist(newPlaylistId);
  }

  async function openPlaylistFile(file: File) {
    const db = await openDatabase();

    const newPlaylistId = uuidv4();
    const json = await file.text();

    let parsed;

    try {
      parsed = JSON.parse(json);
    } catch (e) {
      modals.showOpenPlaylistErrorModal = true;
      console.log(e);
      return;
    }

    const result = PlaylistStorageSchema.safeParse(parsed);
    if (!result.success) {
      modals.showOpenPlaylistErrorModal = true;
      console.log(result.error);
      return;
    }

    const playlist = result.data;

    await db.add('playlists', {
      ...playlist,
      id: newPlaylistId,
      items: withFreshIds(playlist.items),
      queue: withFreshIds(playlist.queue)
    });

    openPlaylist(newPlaylistId);
  }

  async function duplicatePlaylist(id: string) {
    const db = await openDatabase();

    const newPlaylistId = uuidv4();

    const tx = db.transaction('playlists', 'readwrite');

    const playlist = await tx.store.get(id);
    if (!playlist) {
      console.log(`playlist ${id} does not exist anymore`);
      return;
    }

    const newPlaylist = { ...playlist, id: newPlaylistId };
    await tx.store.add(newPlaylist);

    await tx.done;

    localPlaylists = Promise.resolve([newPlaylist, ...(await localPlaylists)]);
  }

  async function deletePlaylist(id: string) {
    const db = await openDatabase();

    await db.delete('playlists', id);

    localPlaylists = Promise.resolve(
      (await localPlaylists).filter((playlist) => playlist.id !== id)
    );
  }

  function dragoverHandler(ev: DragEvent) {
    ev.preventDefault();
    ev.dataTransfer!.dropEffect = 'copy';
  }

  async function dropHandler(ev: DragEvent) {
    ev.preventDefault();

    const dataTransferItems = ev.dataTransfer!.items;
    if (!dataTransferItems || dataTransferItems.length !== 1) {
      return;
    }

    const item = dataTransferItems[0];
    if (item.kind === 'file') {
      const file = item.getAsFile()!;
      if (file.name.endsWith('.json')) {
        openPlaylistFile(file);
      }
    }
  }

  function playlistNotOpenable(id: string) {
    return currentlyOpenPlaylistIds.includes(id);
  }
</script>

<div class="outer-container">
  <div
    class="inner-container overflow"
    role="presentation"
    ondragover={dragoverHandler}
    ondrop={dropHandler}
  >
    <div class="panel-header">
      <h2 class="panel-title">Open a playlist</h2>
    </div>

    <div>
      <button class="button" onclick={openNewPlaylist}>
        <i class="bi bi-plus-lg" aria-hidden="true"></i>
        New playlist
      </button>

      <label class="button" for={`upload-playlist-${componentId}`}>
        <i class="bi-upload" aria-hidden="true"></i>
        Upload from computer
      </label>
      <input
        class="file-input"
        accept="application/json"
        id={`upload-playlist-${componentId}`}
        type="file"
        bind:files
      />
    </div>

    <p class="drop-notice">You can also drop a playlist file here to open it.</p>

    <h3>Recent playlists</h3>

    {#await localPlaylists then playlists}
      {#if playlists.length > 0}
        <div class="row">
          <div></div>

          <div><i>Last modified</i></div>
        </div>

        <ol class="playlist-list">
          {#each playlists as playlist (playlist.id)}
            <PlaylistListItem
              {playlist}
              playlistNotOpenable={playlistNotOpenable(playlist.id)}
              openPlaylist={() => openPlaylist(playlist.id)}
              duplicatePlaylist={() => duplicatePlaylist(playlist.id)}
              deletePlaylist={() => deletePlaylist(playlist.id)}
            />
          {/each}
        </ol>
      {:else}
        <i>No playlists yet</i>
      {/if}
    {/await}
  </div>
</div>

<style>
  .outer-container {
    max-width: 800px;
  }

  .file-input {
    display: none;
  }

  .drop-notice {
    margin: 8px 0 0 4px;
    color: #666;
    font-size: 0.85em;

    -webkit-user-select: none;
    user-select: none;
  }

  .playlist-list {
    display: flex;
    flex-direction: column;

    list-style: none;
    padding: 0px;
    margin: 0px;
  }

  .row {
    display: flex;
    justify-content: space-between;

    padding-left: 4px;
    padding-right: 4px;
    padding-top: 6px;
    padding-bottom: 6px;
  }
</style>
