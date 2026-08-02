<script lang="ts">
  import type { Playlist } from '$lib/schema/playlist';
  import Dropdown from './Dropdown.svelte';

  interface Props {
    playlist: Playlist;
    playlistNotOpenable: boolean;
    openPlaylist: () => void;
    duplicatePlaylist: () => void;
    deletePlaylist: () => void;
  }

  let { playlist, openPlaylist, playlistNotOpenable, duplicatePlaylist, deletePlaylist }: Props =
    $props();

  let showMenu = $state(false);

  function duplicate() {
    duplicatePlaylist();
    showMenu = false;
  }

  function prettyDate(epochMilliseconds: number) {
    return new Date(epochMilliseconds).toLocaleString();
  }
</script>

<li>
  <div class="button-group">
    <button
      class="button transparent playlist-list-item"
      onclick={openPlaylist}
      disabled={playlistNotOpenable}
      class:disabled={playlistNotOpenable}
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
    <Dropdown bind:showMenu duplicatePlaylist={duplicate} {deletePlaylist} />
  </div>
</li>

<style>
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
