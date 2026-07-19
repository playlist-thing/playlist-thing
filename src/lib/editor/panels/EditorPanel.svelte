<script lang="ts">
  import OpenPanel from './OpenPanel.svelte';
  import PlaylistPanel from './PlaylistPanel.svelte';

  interface Props {
    playlistId: string | null;
    currentlyOpenPlaylistIds: (string | null | undefined)[];
  }

  let { playlistId = $bindable(), currentlyOpenPlaylistIds }: Props = $props();
</script>

{#if playlistId === null}
  <OpenPanel bind:playlistId {currentlyOpenPlaylistIds} />
{:else}
  <PlaylistPanel bind:playlistId />
{/if}
