<script>
  import PlaylistPanel from '$lib/panels/PlaylistPanel.svelte';
  import SettingsPanel from '$lib/panels/SettingsPanel.svelte';
  import { spotifyToken, spotifyConnectFromSettings } from '$lib/spotify.js';

  let playlistAVisible = true;
  let playlistBVisible = true;
  let settingsVisible = $state(false);

  function toggleSettings() {
    settingsVisible = !settingsVisible;
  }
</script>

<div class="app">
  <div class="controls-top">
    <div>
      Spotify
      {#if $spotifyToken}
        connected
      {:else}
        <button onclick={spotifyConnectFromSettings}>connect</button>
      {/if}
    </div>

    <div>
      <button class="button transparent" class:inverted={settingsVisible} onclick={toggleSettings}>
        <i class="bi-gear"></i> Settings
      </button>
    </div>
  </div>

  <div class="panels">
    {#if playlistAVisible}
      <PlaylistPanel id={'A'} />
    {/if}
    {#if playlistBVisible}
      <PlaylistPanel id={'B'} />
    {/if}
    {#if settingsVisible}
      <SettingsPanel close={toggleSettings} />
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
    padding: 6px;
  }

  .panels {
    display: flex;
    min-height: 0;
    padding-left: 6px;
    padding-right: 6px;
    padding-bottom: 6px;

    overflow: auto;
  }
</style>
