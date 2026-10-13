<script lang="ts">
  import { dev } from '$app/environment';
  import { resolve } from '$app/paths';

  import Clock from '$lib/editor/Clock.svelte';
  import EditorPanel from '$lib/editor/panels/EditorPanel.svelte';
  import SettingsPanel from '$lib/editor/panels/SettingsPanel.svelte';

  import URLInvalidModal from '$lib/editor/modals/URLInvalidModal.svelte';
  import AddFileErrorModal from '$lib/editor/modals/AddFileErrorModal.svelte';
  import SpotifyConnectModal from '$lib/editor/modals/SpotifyConnectModal.svelte';
  import OpenPlaylistErrorModal from '$lib/editor/modals/OpenPlaylistErrorModal.svelte';

  import { openDatabase } from '$lib/db';
  import { apiToken, apiTokenClaims, redirectToSSOAuthorize } from '$lib/auth/api';
  import { displaySizeMedium } from '$lib/editor/state.svelte';
  import { withFreshIds } from '$lib/editor/state.svelte';
  import { PlaylistExportSchema } from '$lib/schema/export/playlist';
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
  let usernameInitial = $derived(
    typeof $apiTokenClaims?.preferred_username === 'string'
      ? $apiTokenClaims.preferred_username.slice(0, 1).toUpperCase()
      : ''
  );

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

      const result = PlaylistExportSchema.safeParse(parsed);
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
    <div class="controls-top-row left">
      <div class="logo-banner">
        <!-- TODO logo -->
        <a href={resolve('/')} class="button transparent">
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

    <div class="controls-top-row middle">
      {#if dev}
        <div class="dev-mode-indicator">
          <strong>DEV MODE</strong>
        </div>
      {/if}

      <Clock />
    </div>

    <div class="controls-top-row right">
      {#if !$apiToken}
        <button class="button transparent sm-hide" onclick={redirectToSSOAuthorize}>
          <i class="bi-box-arrow-in-right" aria-hidden="true"></i>
          <span class="sm-visually-hidden">Sign in</span>
        </button>
      {/if}
      <button class="button transparent" class:inverted={settingsVisible} onclick={toggleSettings}>
        {#if $apiToken}
          <span class="setting-avatar">{usernameInitial}</span>
        {:else}
          <i class="bi-gear" aria-hidden="true"></i>
        {/if}
        <span class="sm-visually-hidden">Settings</span>
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
    align-items: center;

    padding: 6px;
  }

  .controls-top-row {
    display: flex;
    align-items: center;
  }

  .controls-top-row.left,
  .controls-top-row.right {
    flex: 1;
  }

  .controls-top-row.right {
    justify-content: flex-end;
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

  .setting-avatar {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;

    background-color: #333;
    color: #fff;
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
