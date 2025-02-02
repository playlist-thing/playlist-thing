<script lang="ts">
  import PlaylistPanel from '$lib/panels/PlaylistPanel.svelte';
  import SettingsPanel from '$lib/panels/SettingsPanel.svelte';

  let playlistAVisible = true;
  let playlistBVisible = true;
  let settingsVisible = $state(false);

  function toggleSettings() {
    settingsVisible = !settingsVisible;
  }
</script>

<svelte:head>
  <title>Playlist Editor</title>
</svelte:head>

<div class="app">
  <div class="controls-top">
    <div>
      <!-- TODO logo -->
      Playlist Editor
    </div>

    <div>
      <button class="button transparent" class:inverted={settingsVisible} onclick={toggleSettings}>
        <i class="bi-gear" aria-hidden="true"></i> Settings
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
