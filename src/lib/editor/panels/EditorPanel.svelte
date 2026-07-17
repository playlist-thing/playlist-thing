<script lang="ts">
  import OpenPanel from './OpenPanel.svelte';
  import PlaylistPanel from './PlaylistPanel.svelte';

  interface Props {
    playlistId: string | null;
  }

  let { playlistId = $bindable() }: Props = $props();
</script>

{#if playlistId === null}
  <OpenPanel bind:playlistId />
{:else}
  <PlaylistPanel bind:playlistId />
{/if}
