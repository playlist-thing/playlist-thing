<script>
  import Playlist from '$lib/Playlist.svelte';
  import EditPanel from '$lib/EditPanel.svelte';
  import { editItem, editItemSource } from '$lib/state.js';
  import { timeInfoMode } from '$lib/timeInfo.js';

  $: showPlaylistA = !$editItem || $editItemSource === 'A';
  $: showPlaylistB = !$editItem || $editItemSource === 'B';
  $: showEditPanel = !!$editItem;
</script>

<div class="app">
  <div class="controls-top">
    <div>
      <label for="time-info-selector">Time info</label>
      <select id="time-info-selector" bind:value={$timeInfoMode}>
        <option value="beginsAt">Begins At</option>
        <option value="timeUntilEnd">Time Until End</option>
      </select>
    </div>

    <div>
    <button class="button transparent">
      <i class="bi-gear" /> Settings
    </button>
    </div>
  </div>

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
  @import '$lib/style/forms.css';

  .app {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
  }

  .controls-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
