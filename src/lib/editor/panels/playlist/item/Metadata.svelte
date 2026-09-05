<script lang="ts">
  import { type PlaylistItem, fileMatchesTitle } from '$lib/schema/playlist';

  interface Props {
    item: PlaylistItem;
  }

  let { item }: Props = $props();
</script>

<div class="metadata">
  {#if item.tag === 'AirBreak' || item.tag === 'AirBreakWithBackgroundMusic'}
    <div class="metadata-row" class:air-break-with-bg={item.tag === 'AirBreakWithBackgroundMusic'}>
      <div>
        <i class="bi bi-mic"></i>
        {#if item.tag === 'AirBreakWithBackgroundMusic'}
          <i>Air break with background music</i>
        {:else}
          <i>Air break</i>
        {/if}
      </div>
    </div>
  {/if}
  {#if item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic'}
    <div class="metadata-row">
      <div>
        <i class="bi bi-music-note"></i>
        {#if item.content.title}
          {item.content.title}
        {:else}
          <i>No title</i>
        {/if}
      </div>

      <div>
        <i class="bi bi-person"></i>
        {#if item.content.artist}
          {item.content.artist}
        {:else}
          <i>No artist</i>
        {/if}
      </div>
    </div>

    <div class="metadata-row bottom">
      <div>
        <i class="bi bi-vinyl"></i>
        {#if item.content.album}
          {item.content.album}
        {:else}
          <i>No album</i>
        {/if}
      </div>

      <div>
        {#if item.internalNotes != '' || item.publicNotes != ''}
          <i class="bi-sticky"></i>
        {/if}
        {#if 'file' in item.content.attributes}
          {#if fileMatchesTitle(item)}
            <i class="bi-file-earmark"></i>
          {:else}
            <span class="file-indicator warning">
              <i class="bi-file-earmark"></i>
            </span>
          {/if}
        {/if}
        {#if 'spotify.com' in item.content.attributes}
          <i class="bi-spotify"></i>
        {/if}
        {#if 'music.apple.com' in item.content.attributes}
          <i class="bi-apple"></i>
        {/if}
        {#if 'youtube.com' in item.content.attributes}
          <i class="bi-youtube"></i>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .metadata {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .metadata-row {
    display: flex;
    flex-wrap: wrap;

    column-gap: 1em;
    row-gap: 4px;
  }

  .metadata-row.air-break-with-bg {
    padding-bottom: 4px;
  }

  .metadata-row.bottom {
    font-size: 0.85em;
  }

  .file-indicator.warning {
    color: #fff;
    background-color: var(--danger);
    border-radius: 1em;
    padding: 0px 10px;
  }
</style>
