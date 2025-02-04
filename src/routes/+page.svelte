<script lang="ts">
  import { dev } from '$app/environment';

  import PlaylistPanel from '$lib/panels/PlaylistPanel.svelte';
  import AboutPanel from '$lib/panels/AboutPanel.svelte';
  import SettingsPanel from '$lib/panels/SettingsPanel.svelte';

  let playlistAVisible = true;
  let playlistBVisible = true;
  let aboutVisible = $state(false);
  let settingsVisible = $state(false);

  function toggleAbout() {
    aboutVisible = !aboutVisible;
  }

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
      <button class="button transparent" class:inverted={aboutVisible} onclick={toggleAbout}>
        <!-- TODO logo -->
        Playlist Editor
      </button>
    </div>

    {#if dev}
      <div class="dev-mode">
        <strong>DEV MODE</strong>
      </div>
    {/if}

    <div>
      <button class="button transparent" class:inverted={settingsVisible} onclick={toggleSettings}>
        <i class="bi-gear" aria-hidden="true"></i> Settings
      </button>
    </div>
  </div>

  <div class="panels">
    {#if aboutVisible}
      <AboutPanel />
    {/if}
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

  .dev-mode {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 10px;
    padding-bottom: 10px;

    background-color: #000;
    color: #fff;

    border-radius: 3px;
  }
</style>
