<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';

  import PlaylistPanel from '$lib/panels/PlaylistPanel.svelte';
  import SettingsPanel from '$lib/panels/SettingsPanel.svelte';

  let playlistAVisible = true;
  let playlistBVisible = true;
  let settingsVisible = $state(false);

  let serviceWorkerHealth: Promise<Response> | null = $state(null);

  function toggleSettings() {
    settingsVisible = !settingsVisible;
  }

  onMount(() => {
    serviceWorkerHealth = fetch('/_localapi/health');
  });
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

    {#if dev}
      <div class="dev-mode-indicator">
        <strong>DEV MODE</strong>
      </div>
    {/if}

    <div class="controls-top-right">
      {#snippet serviceWorkerError()}
        <div class="controls-top-error-indicator">
          <i class="bi bi-exclamation-triangle"></i>
          Local saving is not available
        </div>
      {/snippet}

      {#if serviceWorkerHealth}
        {#await serviceWorkerHealth then response}
          {#if !response || !response.ok}
            {@render serviceWorkerError()}
          {/if}
        {:catch}
          {@render serviceWorkerError()}
        {/await}
      {/if}

      <button class="button transparent" class:inverted={settingsVisible} onclick={toggleSettings}>
        <i class="bi-gear" aria-hidden="true"></i> Settings
      </button>
    </div>
  </div>

  <div class="panels">
    {#if playlistAVisible}
      <PlaylistPanel panelId={'A'} />
    {/if}
    {#if playlistBVisible}
      <PlaylistPanel panelId={'B'} />
    {/if}
    {#if settingsVisible}
      <SettingsPanel close={toggleSettings} />
    {/if}
  </div>
</div>

<style>
  @import '$lib/style/colors.css';
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

  .controls-top-right {
    display: flex;
    align-items: center;
  }

  .controls-top-error-indicator {
    color: var(--danger);
  }

  .panels {
    display: flex;
    justify-content: center;
    min-height: 0;

    padding-left: 6px;
    padding-right: 6px;
    padding-bottom: 6px;

    overflow: auto;
  }

  .dev-mode-indicator {
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 10px;
    padding-bottom: 10px;

    background-color: #000;
    color: #fff;

    border-radius: 3px;
  }
</style>
