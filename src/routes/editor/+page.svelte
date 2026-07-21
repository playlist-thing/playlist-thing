<script lang="ts">
  import { dev } from '$app/environment';

  import AccountMenu from '$lib/AccountMenu.svelte';

  import EditorPanel from '$lib/editor/panels/EditorPanel.svelte';
  import SettingsPanel from '$lib/editor/panels/SettingsPanel.svelte';

  import URLInvalidModal from '$lib/editor/modals/URLInvalidModal.svelte';
  import AddFileErrorModal from '$lib/editor/modals/AddFileErrorModal.svelte';
  import SpotifyConnectModal from '$lib/editor/modals/SpotifyConnectModal.svelte';
  import OpenPlaylistErrorModal from '$lib/editor/modals/OpenPlaylistErrorModal.svelte';

  import { openDatabase } from '$lib/db';
  import { displaySizeMedium } from '$lib/editor/state.svelte';
  import { withFreshIds } from '$lib/editor/state.svelte';
  import { PlaylistStorageSchema } from '$lib/schema/playlist';
  import localStorageStore from '$lib/localStorageStore';
  import { v4 as uuidv4 } from 'uuid';
  import { onMount } from 'svelte';

  let doublePlaylistView = localStorageStore('doublePlaylistView', false);
  let playlistIdPanelA = localStorageStore<string | null | undefined>(
    'playlistIdPanelA',
    undefined
  );
  let playlistIdPanelB = localStorageStore<string | null | undefined>(
    'playlistIdPanelB',
    undefined
  );

  let settingsVisible = $state(false);
  let playlistAVisible = true;
  let playlistBVisible = $derived(displaySizeMedium.current && $doublePlaylistView);
  let currentlyOpenPlaylistIds = $derived([$playlistIdPanelA, $playlistIdPanelB]);

  $effect(() => {
    if (!playlistBVisible) {
      $playlistIdPanelB = null;
    }
  });

  onMount(async () => {
    if ($playlistIdPanelA === undefined) {
      $playlistIdPanelA = null;
    }

    if ($playlistIdPanelB === undefined) {
      $playlistIdPanelB = null;
    }

    await migrateFromLocalStorageToIdb();
  });

  // TODO remove 2027-08 (one year after migration)
  async function migrateFromLocalStorageToIdb() {
    const storedPlaylistA = localStorage.getItem('playlistA');
    const storedPlaylistB = localStorage.getItem('playlistB');

    if (storedPlaylistA === null && storedPlaylistB === null) {
      return;
    }

    const db = await openDatabase();

    async function migratePlaylist(
      storageKey: 'playlistA' | 'playlistB',
      storedPlaylist: string | null,
      currentPlaylistId: string | null | undefined,
      setPlaylistId: (playlistId: string) => void
    ) {
      if (storedPlaylist === null) {
        return;
      }

      if (currentPlaylistId !== null) {
        localStorage.removeItem(storageKey);
        return;
      }

      let parsed;

      try {
        parsed = JSON.parse(storedPlaylist);
      } catch (error) {
        console.log(error);
        localStorage.removeItem(storageKey);
        return;
      }

      const result = PlaylistStorageSchema.safeParse(parsed);
      if (!result.success) {
        console.log(result.error);
        localStorage.removeItem(storageKey);
        return;
      }

      const playlistId = uuidv4();
      await db.add('playlists', {
        ...result.data,
        id: playlistId,
        items: withFreshIds(result.data.items),
        queue: withFreshIds(result.data.queue)
      });

      setPlaylistId(playlistId);
      localStorage.removeItem(storageKey);
    }

    await migratePlaylist('playlistA', storedPlaylistA, $playlistIdPanelA, (playlistId) => {
      $playlistIdPanelA = playlistId;
    });
    await migratePlaylist('playlistB', storedPlaylistB, $playlistIdPanelB, (playlistId) => {
      $playlistIdPanelB = playlistId;
    });
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
    <div class="controls-top-row">
      <div class="logo-banner">
        <!-- TODO logo -->
        <a href="/" class="button transparent">
          <span class="banner-text">playlist-thing</span>
        </a>
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
      <AccountMenu />
      <button class="button transparent" class:inverted={settingsVisible} onclick={toggleSettings}>
        <i class="bi-gear" aria-hidden="true"></i> Settings
      </button>
    </div>
  </div>

  <div class="panels">
    {#if playlistAVisible && $playlistIdPanelA !== undefined}
      <EditorPanel bind:playlistId={$playlistIdPanelA} {currentlyOpenPlaylistIds} />
    {/if}
    {#if playlistBVisible && $playlistIdPanelB !== undefined}
      <EditorPanel bind:playlistId={$playlistIdPanelB} {currentlyOpenPlaylistIds} />
    {/if}
    {#if settingsVisible}
      <SettingsPanel close={toggleSettings} />
    {/if}
  </div>
</div>

<URLInvalidModal />
<AddFileErrorModal />
<SpotifyConnectModal />
<OpenPlaylistErrorModal />

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
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

  .banner-text {
    font-size: 1.1em;
    font-weight: bold;
  }

  .panels {
    display: flex;
    justify-content: center;
    flex: 1;

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
