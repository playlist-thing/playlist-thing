<script lang="ts">
  import OpenPanel from './OpenPanel.svelte';
  import PlaylistPanel from './PlaylistPanel.svelte';

  import localStorageStore from '$lib/localStorageStore';
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
</script>

{#if $playlistId !== undefined}
  {#if $playlistId[panelId] === null}
    <OpenPanel bind:playlistId={$playlistId[panelId]} {panelId} />
  {:else}
    <PlaylistPanel bind:playlistId={$playlistId[panelId]} />
  {/if}
{/if}
