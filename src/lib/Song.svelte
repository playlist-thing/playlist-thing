<script>
  import { createEventDispatcher } from 'svelte';

  import { formatSeconds } from '$lib/format.js';

  export let item;
  export let timeInfo;
  export let editing;

  const dispatch = createEventDispatcher();

  function rowClass(item) {
    if (item.pause) {
      return 'row pause';
    } else if (!item.artist || !item.title || !item.album || !item.seconds) {
      return 'row missing-info';
    } else if (!item.file) {
      return 'row missing-file';
    } else {
      return 'row';
    }
  }

  function toggleEdit() {
    if (editing) {
      dispatch('stopedit');
    } else {
      dispatch('edit');
    }
  }

  function deleteItem() {
    dispatch('delete', item.id);
  }

  function searchUrl(item) {
    const searchTerm = `${item.title} ${item.artist}`;
    const searchUrl = `https://music.youtube.com/search?q=`;
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
          const spotifyUrlPrefix = 'https://open.spotify.com/track/';

          if (dataTransferItem.type === 'text/plain') {
            // when dragging from spotify, multiple lines in
            // text/plain gets mangled into one single line in
            // text/uri-list
            dataTransferItem.getAsString((lines) => {
              lines.split('\n').forEach((line) => {
                if (line.startsWith(spotifyUrlPrefix)) {
                  item.spotifyTrackId = line.substring(spotifyUrlPrefix.length);
                }
              });
            });
          }
        }
      }
    }
  }
</script>

<div class={rowClass(item)}>
  <div class="time-and-metadata">
    <div class="time-info">
      <div>
        {formatSeconds(timeInfo)}
      </div>
    </div>

    {#if item.pause && !item.title}
      <div>
        <i class="bi bi-mic" /> <i>Air break</i>
      </div>
    {:else}
      <div>
        <div class="metadata-row top">
          <div>
            <i class="bi bi-music-note" />
            {#if item.title}
              {item.title}
            {:else}
              <i>No title</i>
            {/if}
          </div>

          <div>
            <i class="bi bi-person" />
            {#if item.artist}
              {item.artist}
            {:else}
              <i>No artist</i>
            {/if}
          </div>
        </div>

        <div class="metadata-row bottom">
          <div>
            <i class="bi bi-vinyl" />
            {#if item.album}
              {item.album}
            {:else}
              <i>No album</i>
            {/if}
          </div>

          <div>
            {#if item.file}
              <i class="bi-file-earmark" />
            {/if}
            {#if item.spotifyTrackId}
              <i class="bi-spotify" />
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <div class="buttons-right">
    <div class="button-group">
      <a class="button" title="Search" href={searchUrl(item)} target="_blank">
        <i class="bi-search" />
      </a>
      <button class="button" class:inverted={editing} title="Edit" on:click={toggleEdit}>
        <i class="bi-pencil" />
      </button>
      <button class="button" title="Delete" on:click={deleteItem}>
        <i class="bi-trash" />
      </button>
    </div>
  </div>
</div>

<style>
  @import '$lib/style/table.css';
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
