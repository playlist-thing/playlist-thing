<script lang="ts">
  import { v4 as uuidv4 } from 'uuid';

  import { openDatabase } from '$lib/db';
  import { emptyPlaylist, type Playlist } from '$lib/schema/playlist';
  import { onMount } from 'svelte';

  interface Props {
    playlistId: string | null;
  }

  let { playlistId = $bindable() }: Props = $props();

  let localPlaylists: Promise<Playlist[]> = $state(new Promise(() => {}));

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
</script>

<div class="outer-container">
  <div class="inner-container overflow">
    <h1>Open a playlist</h1>

    <div>
      <button class="button" onclick={openNewPlaylist}>
        <i class="bi bi-plus-lg" aria-hidden="true"></i>
        New playlist
      </button>
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
                    {new Date(playlist.lastModifiedAt)}
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
