<script lang="ts">
  import OpenPanel from './OpenPanel.svelte';
  import PlaylistPanel from './PlaylistPanel.svelte';

  interface Props {
    playlistId: string | null;
    openPlaylistIds: (string | null | undefined)[];
  }

  let { playlistId = $bindable(), openPlaylistIds }: Props = $props();
</script>

{#if playlistId === null}
  <OpenPanel bind:playlistId {openPlaylistIds} />
{:else}
  <PlaylistPanel bind:playlistId />
{/if}
