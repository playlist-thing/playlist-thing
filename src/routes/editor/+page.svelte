<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';

  import PlaylistPanel from '$lib/editor/panels/PlaylistPanel.svelte';
  import SettingsPanel from '$lib/editor/panels/SettingsPanel.svelte';

  import URLInvalidModal from '$lib/editor/modals/URLInvalidModal.svelte';
  import AddFileErrorModal from '$lib/editor/modals/AddFileErrorModal.svelte';
  import SpotifyConnectModal from '$lib/editor/modals/SpotifyConnectModal.svelte';

  import { displaySizeMedium } from '$lib/editor/state.svelte.ts';
  import localStorageStore from '$lib/localStorageStore';

  let doublePlaylistView = localStorageStore("doublePlaylistView", false);
  let settingsVisible = $state(false);
  let playlistAVisible = true;
  let playlistBVisible = $derived(displaySizeMedium.current && $doublePlaylistView);

  function toggleSettings() {
    settingsVisible = !settingsVisible;
  }
</script>

<svelte:head>
  <title>Playlist Editor</title>
</svelte:head>

<div class="app">
  <div class="controls-top">
    <div class="controls-top-row">
      <div class="logo-banner">
        <!-- TODO logo -->
        Playlist Editor
      </div>

      <div class="button-group sm-hide">
        <button
          class="button"
          class:inverted={!$doublePlaylistView}
          disabled={!$doublePlaylistView}
          onclick={() => ($doublePlaylistView = false)}
        >
          <i class="bi-window"></i>
          <span class="visually-hidden">Single playlist view</span>
        </button>
        <button
          class="button"
          class:inverted={$doublePlaylistView}
          disabled={$doublePlaylistView}
          onclick={() => ($doublePlaylistView = true)}
        >
          <i class="bi-window-split"></i>
          <span class="visually-hidden">Double playlist view</span>
        </button>
      </div>
    </div>

    {#if dev}
      <div class="dev-mode-indicator">
        <strong>DEV MODE</strong>
      </div>
    {/if}

    <div class="controls-top-row">
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

<URLInvalidModal />
<AddFileErrorModal />
<SpotifyConnectModal />

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/colors.css';
  @import '$lib/style/forms.css';
  @import '$lib/style/responsive.css';

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

  .controls-top-row {
    display: flex;
    align-items: center;
  }

  .logo-banner {
    padding-right: 10px;
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
