<script>
  import { createEventDispatcher } from 'svelte';

  import { getSpotifyTrack } from '$lib/spotify.js';

  export let item;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

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
</script>

<div class="outer-container">
  <div class="inner-container">
    <div class="header">
      <h1 class="title">Edit track</h1>

      <button class="button transparent close" on:click={close}>
        <i class="bi-x-lg" />
      </button>
    </div>

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

        <label class="label" for="label">Label</label>
        <input class="input-text" id="label" type="text" bind:value={item.label} />

        {#if item.spotifyTrackId}
          <button class="button" on:click={fillFromSpotify}>
            Fill missing information from Spotify
          </button>
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

        <label class="label" for="youtube-id">YouTube ID</label>
        <input class="input-text" id="youtube-id" type="text" bind:value={item.youtubeId} />

        <label class="label" for="apple-music-track-id">Apple Music Track ID</label>
        <input
          class="input-text"
          id="apple-music-track-id"
          type="text"
          bind:value={item.appleMusicTrackId}
        />

        <label class="label" for="bandcamp-track-url">Bandcamp Track URL</label>
        <input
          class="input-text"
          id="bandcamp-track-url"
          type="text"
          bind:value={item.bandcampTrackUrl}
        />

        <label class="label" for="file">File</label>
        <input class="input-text" id="file" type="text" bind:value={item.file} />
      </div>
    </div>

    <div class="input-block">
      <label class="label" for="notes">Notes</label>
      <textarea class="input-text" id="notes" rows="10" bind:value={item.notes} />

      <div>
        <input id="pause" type="checkbox" bind:checked={item.pause} />
        <label for="pause">Pause</label>
      </div>
    </div>
  </div>
</div>

<style>
  @import '$lib/style/forms.css';
  @import '$lib/style/panel.css';

  .input-block-group {
    display: flex;
  }

  .input-block {
    display: flex;
    flex-direction: column;
  }
</style>
