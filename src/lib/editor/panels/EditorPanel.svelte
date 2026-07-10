<script lang="ts">
  import PlaylistPanel from './PlaylistPanel.svelte';

  interface Props {
    panelId: string;
  }

  let { panelId }: Props = $props();
</script>

<PlaylistPanel {panelId} />
