<script lang="ts">
  import type { Playlist } from '$lib/schema/playlist';

  interface Props {
    playlist: Playlist;
    playlistNotOpenable: boolean;
    openPlaylist: () => void;
  }

  let { playlist, openPlaylist, playlistNotOpenable }: Props = $props();

  function prettyDate(epochMilliseconds: number) {
    return new Date(epochMilliseconds).toLocaleString();
  }
</script>

<li>
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
