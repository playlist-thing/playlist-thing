<script>
  import Playlist from '$lib/Playlist.svelte';
  import EditPanel from '$lib/EditPanel.svelte';
  import { editItem, editItemSource } from '$lib/state.js';

  $: showPlaylistA = !$editItem || $editItemSource === 'A';
  $: showPlaylistB = !$editItem || $editItemSource === 'B';
  $: showEditPanel = !!$editItem;
</script>

<div class="app">
  <div class="global-controls"></div>

  <div class="playlists">
    {#if showPlaylistA}
      <Playlist id={'A'} />
    {/if}
    {#if showEditPanel}
      <EditPanel />
    {/if}
    {#if showPlaylistB}
      <Playlist id={'B'} />
    {/if}
  </div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
  }

  .global-controls {
    padding: 0.3em;
  }

  .playlists {
    display: flex;
    min-height: 0;
    padding-left: 0.3em;
    padding-right: 0.3em;
    padding-bottom: 0.3em;
  }
</style>
