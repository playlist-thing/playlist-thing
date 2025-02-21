<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';

  import PlaylistPanel from '$lib/panels/PlaylistPanel.svelte';
  import SettingsPanel from '$lib/panels/SettingsPanel.svelte';

  let playlistAVisible = true;
  let playlistBVisible = true;
  let settingsVisible = $state(false);

  // default to healthy so that SSR does not produce the error message
  let serviceWorkerHealth: Promise<Response> = $state(
    Promise.resolve(Response.json({ status: 'OK' }))
  );

  function toggleSettings() {
    settingsVisible = !settingsVisible;
  }

  onMount(async () => {
    await navigator.serviceWorker.ready;

    // periodically check service worker health
    setInterval(() => {
      serviceWorkerHealth = fetch('https://localapi.playlist-thing.com/health');
    }, 10 * 1000);
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
          <i class="bi-exclamation-triangle"></i>
          Local saving is not available
        </div>
      {/snippet}

      {#await serviceWorkerHealth then response}
        {#if !response || !response.ok}
          {@render serviceWorkerError()}
        {/if}
      {:catch}
        {@render serviceWorkerError()}
      {/await}

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
