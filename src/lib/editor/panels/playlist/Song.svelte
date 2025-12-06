<script lang="ts">
  import { dragHandle } from 'svelte-dnd-action';

  import SongEditor from './SongEditor.svelte';

  import { formatSeconds } from '$lib/format.ts';
  import { quickSearchUrl } from '$lib/editor/settings.ts';
  import { spotifyTrackIdFromUrl } from '$lib/editor/external/spotify.ts';
  import { youtubeIdFromUrl } from '$lib/editor/external/youtube.ts';
  import { appleMusicTrackIdFromUrl } from '$lib/editor/external/appleMusic.ts';
  import { validBandcampUrl } from '$lib/editor/external/bandcamp.ts';
  import type { PlaylistItem } from '$lib/playlist.ts';
  import { searchUrl } from '$lib/editor/search.ts';
  import { displaySizeMedium } from '$lib/editor/state.svelte.ts';

  interface Props {
    item: PlaylistItem;
    timeInfo: number;
    deleteItem: () => void;
  }

  let { item = $bindable(), timeInfo, deleteItem }: Props = $props();

  let editing = $state(false);

  function rowClass(item: PlaylistItem) {
    if (!item.seconds) {
      return 'missing-info';
    } else {
      if (item.tag === 'AirBreak') {
        return 'pause';
      } else {
        if (!item.content.artist || !item.content.title) {
          return 'missing-info';
        } else {
          if (item.tag === 'AirBreakWithBackgroundMusic') {
            return 'pause';
          } else if (item.tag === 'Song') {
            return '';
          }
        }
      }
    }
  }

  function toggleEdit() {
    editing = !editing;
  }

  function dragoverHandler(ev: DragEvent) {
    ev.preventDefault();
    ev.dataTransfer!.dropEffect = 'copy';
  }

  function dropHandler(ev: DragEvent) {
    ev.preventDefault();

    const dataTransferItems = ev.dataTransfer!.items;
    if (dataTransferItems) {
      for (const dataTransferItem of dataTransferItems) {
        if (dataTransferItem.kind === 'file') {
          if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
            const file = dataTransferItem.getAsFile()!;
            item.content.attributes.file = file.name;
          }
        } else if (dataTransferItem.kind === 'string') {
          if (dataTransferItem.type === 'text/plain') {
            // when dragging from spotify, multiple lines in
            // text/plain gets mangled into one single line in
            // text/uri-list
            dataTransferItem.getAsString((lines) => {
              const split = lines.split('\n');
              for (const line of split) {
                if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
                  const spotifyTrackId = spotifyTrackIdFromUrl(line);
                  if (spotifyTrackId !== null) {
                    item.content.attributes['spotify.com'] = spotifyTrackId;
                  }

                  const youtubeId = youtubeIdFromUrl(line);
                  if (youtubeId !== null) {
                    item.content.attributes['youtube.com'] = youtubeId;
                  }

                  const appleMusicTrackId = appleMusicTrackIdFromUrl(line);
                  if (appleMusicTrackId !== null) {
                    item.content.attributes['music.apple.com'] = appleMusicTrackId;
                  }

                  if (validBandcampUrl(line)) {
                    item.content.attributes['bandcamp.com'] = line;
                  }
                }
              }
            });
          }
        }
      }
    }
  }
</script>

<div role="listitem" class={rowClass(item)} ondragover={dragoverHandler} ondrop={dropHandler}>
  <div class="row">
    <div class="time-and-metadata">
      {#if !displaySizeMedium.current}
        <div use:dragHandle aria-label="drag-handle for {item.id}" class="drag-handle">
          <i class="bi-list" aria-hidden="true"></i>
        </div>
      {/if}

      <div class="time-info">
        <div>
          {formatSeconds(timeInfo)}
        </div>
      </div>

      <div>
        {#if item.tag === 'AirBreak' || item.tag === 'AirBreakWithBackgroundMusic'}
          <div
            class="metadata-row"
            class:air-break-with-bg={item.tag === 'AirBreakWithBackgroundMusic'}
          >
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
          <div class="metadata-row top">
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
              {#if 'file' in item.content.attributes}
                <i class="bi-file-earmark"></i>
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
    </div>

    <div class="buttons-right">
      <div class="button-group">
        {#if displaySizeMedium.current && $quickSearchUrl && (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic')}
          <a
            class="button"
            title="Search"
            href={searchUrl(item.content, $quickSearchUrl)}
            target="_blank"
            rel="external"
          >
            <i class="bi-search" aria-hidden="true"></i>
            <span class="visually-hidden">Search</span>
          </a>
        {/if}
        <button class="button" class:inverted={editing} onclick={toggleEdit}>
          <i class="bi-pencil" aria-hidden="true"></i>
          <span class="visually-hidden">Edit</span>
        </button>
        <button class="button" onclick={deleteItem}>
          <i class="bi-trash" aria-hidden="true"></i>
          <span class="visually-hidden">Delete</span>
        </button>
      </div>
    </div>
  </div>
  {#if editing}
    <SongEditor bind:item />
  {/if}
</div>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';

  .row {
    display: flex;
    justify-content: space-between;

    padding-left: 4px;
    padding-right: 4px;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .drag-handle {
    font-size: 1.3em;

    padding-left: 5px;
    padding-right: 10px;
  }

  .time-and-metadata {
    display: flex;
    align-items: center;
  }

  .time-info {
    flex-shrink: 0;

    width: 60px;
  }

  .metadata-row {
    display: flex;
    flex-wrap: wrap;
  }

  .metadata-row > :first-child {
    padding-right: 1em;
  }

  .metadata-row.top > div {
    padding-bottom: 6px;
  }

  .metadata-row.air-break-with-bg > div {
    padding-bottom: 10px;
  }

  .metadata-row.bottom {
    font-size: 0.85em;
  }

  .pause {
    color: #fff;
    background-color: #000;
  }

  .missing-info {
    background-color: #fe755f;
  }

  .missing-file {
    background-color: #fae970;
  }

  .buttons-right {
    display: flex;
    align-items: center;
  }
</style>
