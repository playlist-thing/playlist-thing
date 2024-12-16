<script>
  import { editItem, finishEdit } from '$lib/state.js';
  import { getSpotifyTrack } from '$lib/spotify.js';

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
    $editItem = overwriteOnlyFalsy($editItem, spotifyItem);
  }
</script>

<div class="outer-container">
  <div class="inner-container">
    <div class="header">
      <h1 class="title">Edit track</h1>

      <button class="button transparent close" on:click={finishEdit}>
        <i class="bi-x-lg" />
      </button>
    </div>

    <div class="input-block-group">
      <div class="input-block">
        <label class="label" for="artist">Artist</label>
        <input class="input-text" id="artist" type="text" bind:value={$editItem.artist} />

        <label class="label" for="title">Title</label>
        <input class="input-text" id="title" type="text" bind:value={$editItem.title} />

        <label class="label" for="album">Album</label>
        <input class="input-text" id="album" type="text" bind:value={$editItem.album} />

        <label class="label" for="released">Released</label>
        <input class="input-text" id="released" type="text" bind:value={$editItem.released} />

        {#if $editItem.spotifyTrackId}
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
          bind:value={$editItem.spotifyTrackId}
        />

        <label class="label" for="youtube-id">YouTube ID</label>
        <input
          class="input-text"
          id="youtube-id"
          type="text"
          bind:value={$editItem.youtubeId}
        />

        <label class="label" for="apple-music-track-id">Apple Music Track ID</label>
        <input
          class="input-text"
          id="apple-music-track-id"
          type="text"
          bind:value={$editItem.appleMusicTrackId}
        />

        <label class="label" for="bandcamp-track-url">Bandcamp Track URL</label>
        <input
          class="input-text"
          id="bandcamp-track-url"
          type="text"
          bind:value={$editItem.bandcampTrackUrl}
        />

        <label class="label" for="file">File</label>
        <input class="input-text" id="file" type="text" bind:value={$editItem.file} />
      </div>
    </div>

    <div class="input-block">
      <label class="label" for="notes">Notes</label>
      <textarea class="input-text" id="notes" rows="10" bind:value={$editItem.notes} />

      <div>
        <input id="pause" type="checkbox" bind:checked={$editItem.pause} />
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
