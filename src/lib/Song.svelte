<script>
  import { createEventDispatcher } from 'svelte';

  import EditableTd from '$lib/EditableTd.svelte';
  import { formatSeconds, parseDuration } from '$lib/format.js';
  import { editItem } from '$lib/state.js';

  export let item;
  export let timeInfo;

  let editItemSubscription;

  const dispatch = createEventDispatcher();

  function inputDuration(ev) {
    const raw = ev.target.textContent;
    item.seconds = parseDuration(raw);
  }

  function rowClass(item) {
    if (item.pause) {
      return 'pause';
    } else if (!item.artist || !item.title || !item.album || !item.seconds) {
      return 'missing-info';
    } else if (!item.file) {
      return 'missing-file';
    } else {
      return '';
    }
  }

  function edit() {
    // without clone, edits would be directly reflected even when not saving changes
    $editItem = structuredClone(item);

    // subscribe for the result (cancel or finish)
    editItemSubscription = editItem.subscribe(editFinish);
  }

  function editFinish(newItem) {
    // called from edit
    if (!editItemSubscription) return;

    if (newItem) {
      // edit finished, not cancelled
      item = newItem;
    }

    editItemSubscription(); // unsubscribe
    editItemSubscription = null;
  }

  function searchUrl() {
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

<tr class={rowClass(item)}>
  <EditableTd bind:text={item.artist} />
  <EditableTd bind:text={item.title} />
  <EditableTd bind:text={item.album} cssClass="priority-low" />
  <td class="priority-medium">{formatSeconds(timeInfo)}</td>
  <td on:focusout={inputDuration} contenteditable>{formatSeconds(item.seconds)}</td>
  <td class="priority-low" on:dragover={dragoverHandler} on:drop={dropHandler}>
    {#if item.file}
      <i class="bi-file-earmark" />
    {/if}
    {#if item.spotifyTrackId}
      <i class="bi-spotify" />
    {/if}
  </td>
  <td>
    <div class="buttons-right">
      <div class="button-group">
        <a class="button" title="Search" href={searchUrl()} target="_blank">
          <i class="bi-search" />
        </a>
        <button class="button" title="Edit" on:click={edit}>
          <i class="bi-pencil" />
        </button>
        <button class="button" title="Delete" on:click={dispatch('delete', item.id)}>
          <i class="bi-trash" />
        </button>
      </div>
    </div>
  </td>
</tr>

<style>
  @import '$lib/style/table.css';
  @import '$lib/style/forms.css';

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
    justify-content: right;
    align-items: center;
  }
</style>
