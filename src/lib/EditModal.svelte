<script>
  import { onMount } from 'svelte';

  import { editItem } from '$lib/state.js';
  import { getSpotifyTrack } from '$lib/spotify.js';

  // our local copy of the item to edit
  let item;
  let modalElement;

  $: modalElement && openCloseModal(item);

  function overwriteOnlyFalsy(target, source) {
    Object.keys(source).forEach((key) => {
      if (!target[key]) {
        target[key] = source[key];
      }
    });

    return target;
  }

  async function fillFromSpotify() {
    const spotifyItem = await getSpotifyTrack(item.spotifyTrackId);
    item = overwriteOnlyFalsy(item, spotifyItem);
  }

  function openCloseModal(item) {
    if (!item) {
      modalElement.close();
    } else {
      modalElement.showModal();
    }
  }

  function cancel() {
    $editItem = null;
  }

  function finish() {
    $editItem = item;
  }

  onMount(() => {
    editItem.subscribe((newItem) => {
      if (item) {
        // finishing edit, this component set editItem
        item = null;
      } else {
        // starting edit, some other component set editItem
        item = newItem;
      }
    });
  });
</script>

<dialog bind:this={modalElement} on:mousedown|self={cancel} class="modal">
  <div class="modal-content">
    {#if item}
      <div class="input-block-group">
        <div class="input-block">
          <label class="label" for="artist">Artist</label>
          <input class="input-text" id="artist" type="text" bind:value={item.artist} />

          <label class="label" for="title">Title</label>
          <input class="input-text" id="title" type="text" bind:value={item.title} />

          <label class="label" for="album">Album</label>
          <input class="input-text" id="album" type="text" bind:value={item.album} />

          <label class="label" for="released">Released</label>
          <input class="input-text" id="released" type="text" bind:value={item.released} />

          {#if item.spotifyTrackId}
            <button class="button" on:click={fillFromSpotify}
              >Fill missing information from Spotify</button
            >
          {/if}
        </div>
        <div class="input-block">
          <label class="label" for="spotify-track-id">Spotify Track ID</label>
          <input
            class="input-text"
            id="spotify-track-id"
            type="text"
            bind:value={item.spotifyTrackId}
          />

          <label class="label" for="file">File</label>
          <input class="input-text" id="file" type="text" bind:value={item.file} />
        </div>
      </div>

      <div class="input-block">
        <label class="label" for="notes">Notes</label>
        <textarea class="input-text" id="notes" rows="10" bind:value={item.notes} />
      </div>
    {/if}

    <div class="modal-footer">
      <button class="button" on:click={finish}>Save</button>
    </div>
  </div>
</dialog>

<style>
  @import '$lib/style/forms.css';
  @import '$lib/style/modal.css';

  .input-block-group {
    display: flex;
  }

  .input-block {
    display: flex;
    flex-direction: column;
  }
</style>
