<script lang="ts">
  import { formatSeconds } from '$lib/format.ts';
  import { quickSearchUrl } from '$lib/settings.ts';
  import { spotifyTrackIdFromUrl } from '$lib/external/spotify.ts';
  import { youtubeIdFromUrl } from '$lib/external/youtube.ts';
  import { appleMusicTrackIdFromUrl } from '$lib/external/appleMusic.ts';
  import { validBandcampUrl } from '$lib/external/bandcamp.ts';
  import type { PlaylistItem, SongMetadata } from '$lib/playlist.ts';

  interface Props {
    item: PlaylistItem;
    timeInfo: number;
    editing: boolean;
    startEdit: () => void;
    stopEdit: () => void;
    deleteItem: () => void;
  }

  let { item = $bindable(), timeInfo, editing, startEdit, stopEdit, deleteItem }: Props = $props();

  function rowClass(item: PlaylistItem) {
    if (!item.seconds) {
      return 'row missing-info';
    } else {
      if (item.tag === 'AirBreak') {
        return 'row pause';
      } else {
        if (!item.content.artist || !item.content.title) {
          return 'row missing-info';
        } else {
          if (item.tag === 'AirBreakWithBackgroundMusic') {
            return 'row pause';
          } else if (item.tag === 'Song') {
            return 'row';
          }
        }
      }
    }
  }

  function toggleEdit() {
    if (editing) {
      stopEdit();
    } else {
      startEdit();
    }
  }

  function searchUrl(song: SongMetadata, searchUrl: string) {
    const searchTerm = `${song.title} ${song.artist}`;
    return encodeURI(searchUrl + searchTerm);
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
  <div class="time-and-metadata">
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
      {#if $quickSearchUrl && (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic')}
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
