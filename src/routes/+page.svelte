<script>
  import PlaylistPanel from '$lib/panels/PlaylistPanel.svelte';
  import EditPanel from '$lib/panels/EditPanel.svelte';
  import SettingsPanel from '$lib/panels/SettingsPanel.svelte';
  import { editItem, editItemSource, settingsVisible, toggleSettings } from '$lib/state.js';
  import { spotifyToken, spotifyConnectFromSettings } from '$lib/spotify.js';
  import { timeInfoMode } from '$lib/timeInfo.js';

  $: playlistAVisible = !$editItem || $editItemSource === 'A';
  $: playlistBVisible = !$settingsVisible && (!$editItem || $editItemSource === 'B');
  $: editPanelVisible = !!$editItem;
</script>

<div class="app">
  <div class="controls-top">
    <div>
      <label for="time-info-selector">Time info</label>
      <select id="time-info-selector" bind:value={$timeInfoMode}>
        <option value="beginsAt">Begins At</option>
        <option value="timeUntilEnd">Time Until End</option>
      </select>

      Spotify
      {#if $spotifyToken}
        connected
      {:else}
        <button on:click={spotifyConnectFromSettings}>connect</button>
      {/if}
    </div>

    <div>
      <button class="button transparent" on:click={toggleSettings}>
        <i class="bi-gear" /> Settings
      </button>
    </div>
  </div>

  <div class="playlists">
    {#if playlistAVisible}
      <PlaylistPanel id={'A'} />
    {/if}
    {#if editPanelVisible}
      <EditPanel />
    {/if}
    {#if $settingsVisible}
      <SettingsPanel />
    {/if}
    {#if playlistBVisible}
      <PlaylistPanel id={'B'} />
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
