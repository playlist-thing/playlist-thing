<script lang="ts">
  import { v4 as uuidv4 } from 'uuid';

  import PlaylistPanel from './PlaylistPanel.svelte';

  import localStorageStore from '$lib/localStorageStore';
  import { openDatabase } from '$lib/db';
  import { emptyPlaylist } from '$lib/schema/playlist';
  import { onMount } from 'svelte';

  type PanelId = 'a' | 'b';

  interface Props {
    panelId: PanelId;
  }

  let { panelId }: Props = $props();

  let playlistId = localStorageStore<Record<PanelId, string | null> | undefined>(
    `playlistId`,
    undefined
  );

  onMount(() => {
    if ($playlistId === undefined) {
      $playlistId = { a: null, b: null };
    }
  });

  async function openNewPlaylist() {
    const db = await openDatabase();

    const newPlaylistId = uuidv4();
    const now = Date.now();
    await db.add('playlists', {
      ...emptyPlaylist,
      id: newPlaylistId,
      createdAt: now,
      lastModifiedAt: now
    });

    $playlistId![panelId] = newPlaylistId;
  }
</script>

{#if $playlistId !== undefined}
  {#if $playlistId[panelId] === null}
    <div class="outer-container">
      <div class="inner-container">
        <h1>Open a playlist</h1>

        <div>
          <button class="button" onclick={openNewPlaylist}>
            <i class="bi bi-plus-lg" aria-hidden="true"></i>
            New playlist
          </button>
        </div>
      </div>
    </div>
  {:else}
    <PlaylistPanel playlistId={$playlistId[panelId]} />
  {/if}
{/if}

<style>
  .outer-container {
    max-width: 800px;
  }
</style>
