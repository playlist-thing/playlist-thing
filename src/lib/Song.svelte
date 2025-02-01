<script>
  import { formatSeconds } from '$lib/format.ts';
  import { quickSearchUrl } from '$lib/settings.ts';
  import { spotifyTrackIdFromUrl } from '$lib/external/spotify.ts';
  import { youtubeIdFromUrl } from '$lib/external/youtube.ts';
  import { appleMusicTrackIdFromUrl } from '$lib/external/appleMusic.ts';
  import { validBandcampUrl } from '$lib/external/bandcamp.ts';

  let { item = $bindable(), timeInfo, editing, startEdit, stopEdit, deleteItem } = $props();

  let missingInfo = $derived(!item.artist || !item.title || !item.seconds);

  function rowClass(item) {
    if (item.pause) {
      return 'row pause';
    } else if (missingInfo) {
      return 'row missing-info';
    } else if (!item.file) {
      return 'row missing-file';
    } else {
      return 'row';
    }
  }

  function toggleEdit() {
    if (editing) {
      stopEdit();
    } else {
      startEdit();
    }
  }

  function searchUrl(item, searchUrl) {
    const searchTerm = `${item.title} ${item.artist}`;
    return encodeURI(searchUrl + searchTerm);
  }

  function dragoverHandler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy';
  }

  function dropHandler(ev) {
    ev.preventDefault();

    if (ev.dataTransfer.items) {
      for (const dataTransferItem of ev.dataTransfer.items) {
        if (dataTransferItem.kind === 'file') {
          const file = dataTransferItem.getAsFile();
          item.file = file.name;
        } else if (dataTransferItem.kind === 'string') {
          if (dataTransferItem.type === 'text/plain') {
            // when dragging from spotify, multiple lines in
            // text/plain gets mangled into one single line in
            // text/uri-list
            dataTransferItem.getAsString((lines) => {
              lines.split('\n').forEach((line) => {
                const spotifyTrackId = spotifyTrackIdFromUrl(line);
                if (spotifyTrackId !== null) {
                  item.spotifyTrackId = spotifyTrackId;
                }

                const youtubeId = youtubeIdFromUrl(line);
                if (youtubeId !== null) {
                  item.youtubeId = youtubeId;
                }

                const appleMusicTrackId = appleMusicTrackIdFromUrl(line);
                if (appleMusicTrackId !== null) {
                  item.appleMusicTrackId = appleMusicTrackId;
                }

                if (validBandcampUrl(line)) {
                  item.bandcampTrackUrl = line;
                }
              });
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
      {#if item.pause}
        <div class="metadata-row" class:air-break-with-bg={item.title || item.artist || item.album}>
          <div>
            <i class="bi bi-mic"></i>
            {#if item.title || item.artist || item.album}
              <i>Air break with background music</i>
            {:else}
              <i>Air break</i>
            {/if}
          </div>
        </div>
      {/if}
      {#if !item.pause || item.title || item.artist || item.album}
        <div class="metadata-row top">
          <div>
            <i class="bi bi-music-note"></i>
            {#if item.title}
              {item.title}
            {:else}
              <i>No title</i>
            {/if}
          </div>

          <div>
            <i class="bi bi-person"></i>
            {#if item.artist}
              {item.artist}
            {:else}
              <i>No artist</i>
            {/if}
          </div>
        </div>

        <div class="metadata-row bottom">
          <div>
            <i class="bi bi-vinyl"></i>
            {#if item.album}
              {item.album}
            {:else}
              <i>No album</i>
            {/if}
          </div>

          <div>
            {#if item.file}
              <i class="bi-file-earmark"></i>
            {/if}
            {#if item.spotifyTrackId}
              <i class="bi-spotify"></i>
            {/if}
            {#if item.appleMusicTrackId}
              <i class="bi-apple"></i>
            {/if}
            {#if item.youtubeId}
              <i class="bi-youtube"></i>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="buttons-right">
    <div class="button-group">
      {#if $quickSearchUrl}
        <a
          class="button"
          title="Search"
          href={searchUrl(item, $quickSearchUrl)}
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
