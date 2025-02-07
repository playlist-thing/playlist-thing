<script lang="ts">
  import type { PlaylistItem } from '$lib/playlist.ts';
  import { emptySong, emptySongMetadata } from '$lib/playlist.ts';
  import { formatSeconds, parseDuration } from '$lib/format.ts';
  import { getSpotifyTrack } from '$lib/external/spotify.ts';

  interface Props {
    item: PlaylistItem;
    close: () => void;
  }

  let { item = $bindable(), close }: Props = $props();

  let durationInputElement: HTMLInputElement;

  function convertToAirBreak() {
    if (item.tag === 'Song') {
      item = { ...item, tag: 'AirBreakWithBackgroundMusic' };
    }
  }

  function convertToSong() {
    if (item.tag === 'AirBreakWithBackgroundMusic') {
      item = { ...item, tag: 'Song' };
    } else if (item.tag === 'AirBreak') {
      item = { ...emptySong, id: item.id, seconds: item.seconds, notes: item.notes };
    }
  }

  function addBackgroundMusic() {
    item = {
      id: item.id,
      seconds: item.seconds,
      notes: item.notes,

      tag: 'AirBreakWithBackgroundMusic',
      content: emptySongMetadata
    };
  }

  function removeBackgroundMusic() {
    item = {
      id: item.id,
      seconds: item.seconds,
      notes: item.notes,

      tag: 'AirBreak'
    };
  }

  function inputDuration() {
    const raw = durationInputElement.value;
    item.seconds = parseDuration(raw);
  }

  async function fillFromSpotify() {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      const spotifyItem = await getSpotifyTrack(item.content.links['spotify.com']);
      item = { ...item, ...spotifyItem, id: item.id };
    }
  }
</script>

<div class="outer-container">
  <div class="inner-container overflow">
    <div class="padding-container">
      <div class="header">
        <h1 class="title">Edit item</h1>

        <button class="button transparent close" onclick={close}>
          <i class="bi-x-lg" aria-hidden="true"></i>
          <span class="visually-hidden">Finish editing</span>
        </button>
      </div>

      <div class="tag-switch-buttons">
        <button class="button" class:inverted={item.tag === 'Song'} onclick={convertToSong}>
          <i class="bi-music-note" aria-hidden="true"></i>
          Song
        </button>
        <button
          class="button"
          class:inverted={item.tag === 'AirBreak' || item.tag === 'AirBreakWithBackgroundMusic'}
          onclick={convertToAirBreak}
        >
          <i class="bi-mic" aria-hidden="true"></i>
          Air break
        </button>
      </div>

      <div class="metadata-container">
        {#if item.tag === 'AirBreakWithBackgroundMusic'}
          <div class="background-music-header">
            <span class="background-music-header-title">Background music</span>

            <div class="background-music-header-right">
              <button class="button" onclick={removeBackgroundMusic}>
                <i class="bi-trash" aria-hidden="true"></i>
                Remove
              </button>
            </div>
          </div>
        {:else if item.tag === 'AirBreak'}
          <div class="add-background-music">
            <button class="button" onclick={addBackgroundMusic}>
              <i class="bi-music-note" aria-hidden="true"></i>
              Add background music
            </button>
          </div>
        {/if}

        <div class="input-block">
          {#if item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic'}
            <div class="input-block-item">
              <label class="label" for="title">Title</label>
              <input class="input-text" id="title" type="text" bind:value={item.content.title} />
            </div>

            <div class="input-block-item">
              <label class="label" for="artist">Artist</label>
              <input class="input-text" id="artist" type="text" bind:value={item.content.artist} />
            </div>

            <div class="input-block-item">
              <label class="label" for="album">Album</label>
              <input class="input-text" id="album" type="text" bind:value={item.content.album} />
            </div>

            <div class="input-block-item">
              <label class="label" for="released">Released</label>
              <input
                class="input-text"
                id="released"
                type="text"
                bind:value={item.content.released}
              />
            </div>

            <div class="input-block-item">
              <label class="label" for="label">Label</label>
              <input class="input-text" id="label" type="text" bind:value={item.content.label} />
            </div>
          {/if}

          <div class="input-block-item">
            <label class="label" for="duration">Duration</label>
            <input
              class="input-text"
              id="duration"
              type="text"
              bind:this={durationInputElement}
              value={formatSeconds(item.seconds)}
              onfocusout={inputDuration}
            />
          </div>

          {#if item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic'}
            {#if 'spotify.com' in item.content.links}
              <div class="input-block-item">
                <button class="button" onclick={fillFromSpotify}>
                  <i class="bi-spotify" aria-hidden="true"></i>
                  Get metadata from Spotify
                </button>
              </div>
            {/if}
          {/if}

          <div class="input-block-item">
            <label class="label" for="notes">Notes</label>
            <textarea class="input-text" id="notes" rows="10" bind:value={item.notes}></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';
  @import '$lib/style/panel.css';

  .tag-switch-buttons {
    display: flex;

    padding: 6px;
  }

  .tag-switch-buttons > :not(:last-child) {
    margin-right: 4px;
  }

  .tag-switch-buttons > .button {
    width: 100%;
  }

  .metadata-container {
    padding-top: 5px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .background-music-header {
    display: flex;
    justify-content: space-between;
  }

  .background-music-header-title {
    margin-top: 15px;
    margin-bottom: 15px;

    font-size: 1.4em;
  }

  .background-music-header-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .add-background-music {
    display: flex;
    flex-direction: column;

    padding-top: 10px;
    padding-bottom: 20px;
  }

  .input-block {
    display: flex;
    flex-direction: column;
  }

  .input-block-item {
    display: flex;
    flex-direction: column;
  }

  .input-block-item:not(:last-child) {
    padding-bottom: 7px;
  }
</style>
