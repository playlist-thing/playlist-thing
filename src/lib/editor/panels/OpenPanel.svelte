<script lang="ts">
  import { v4 as uuidv4 } from 'uuid';

  import { openDatabase } from '$lib/db';
  import { emptyPlaylist, PlaylistStorageSchema, type Playlist } from '$lib/schema/playlist';
  import { onMount } from 'svelte';
  import { modals, withFreshIds } from '../state.svelte';

  interface Props {
    playlistId: string | null;
    openPlaylistIds: (string | null | undefined)[];
  }

  let { playlistId = $bindable(), openPlaylistIds }: Props = $props();

  let files: FileList | undefined = $state();

  let localPlaylists: Promise<Playlist[]> = $state(new Promise(() => {}));

  let componentId = $props.id();

  $effect(() => {
    if (files !== undefined && files.length === 1) {
      openPlaylistFile(files[0]);
    }
  });

  async function load() {
    const db = await openDatabase();
    const index = db.transaction('playlists').store.index('lastModifiedAt');

    const result = [];
    for await (const item of index.iterate(null, 'prev')) {
      result.push(item.value);
    }
    return result;
  }

  onMount(() => {
    localPlaylists = load();
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

    playlistId = newPlaylistId;
  }

  async function openPlaylistFile(file: File) {
    const db = await openDatabase();

    const newPlaylistId = uuidv4();
    const json = await file.text();

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

    await db.add('playlists', {
      ...playlist,
      id: newPlaylistId,
      items: withFreshIds(playlist.items),
      queue: withFreshIds(playlist.queue)
    });

    playlistId = newPlaylistId;
  }

  function playlistNotOpenable(id: string) {
    return openPlaylistIds.includes(id);
  }

  function prettyDate(epochMilliseconds: number) {
    return new Date(epochMilliseconds).toLocaleString();
  }
</script>

<div class="outer-container">
  <div class="inner-container overflow">
    <h1>Open a playlist</h1>

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

    <h2>Recent playlists</h2>

    {#await localPlaylists then playlists}
      {#if playlists.length > 0}
        <div class="row">
          <div></div>

          <div><i>Last modified</i></div>
        </div>

        <ol class="playlist-list">
          {#each playlists as playlist}
            <li>
              <button
                class="button transparent playlist-list-item"
                onclick={() => (playlistId = playlist.id)}
                disabled={playlistNotOpenable(playlist.id)}
                class:disabled={playlistNotOpenable(playlist.id)}
              >
                <div class="row">
                  <div>
                    {#if playlist.name}
                      {playlist.name}
                    {:else}
                      <i>Untitled playlist</i>
                    {/if}
                  </div>

                  <div>
                    {prettyDate(playlist.lastModifiedAt)}
                  </div>
                </div>
              </button>
            </li>
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

  .playlist-list {
    display: flex;
    flex-direction: column;

    list-style: none;
    padding: 0px;
    margin: 0px;
  }

  .playlist-list-item {
    width: 100%;
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
