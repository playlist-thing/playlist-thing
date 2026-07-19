<script lang="ts">
  import OpenPanel from './OpenPanel.svelte';
  import PlaylistPanel from './PlaylistPanel.svelte';

  interface Props {
    playlistId: string | null;
    currentlyOpenPlaylistIds: (string | null | undefined)[];
  }

  let { playlistId = $bindable(), currentlyOpenPlaylistIds }: Props = $props();

  function openPlaylist(newPlaylistId: string) {
    playlistId = newPlaylistId;
  }
</script>

{#if playlistId === null}
  <OpenPanel {openPlaylist} {currentlyOpenPlaylistIds} />
{:else}
  <PlaylistPanel bind:playlistId />
{/if}
