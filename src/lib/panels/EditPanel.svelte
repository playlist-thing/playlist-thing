<script lang="ts">
  import LinkAttribute from './edit/LinkAttribute.svelte';
  import FileAttribute from './edit/FileAttribute.svelte';

  import type { PlaylistItem } from '$lib/playlist.ts';
  import { emptySong, emptySongMetadata } from '$lib/playlist.ts';
  import { formatSeconds, parseDuration } from '$lib/format.ts';

  import { searchProviders } from '$lib/settings.ts';
  import { searchUrl } from '$lib/search.ts';

  import {
    spotifyTrackIdFromUrl,
    urlFromSpotifyTrackId,
    getSpotifyTrack
  } from '$lib/external/spotify.ts';
  import { youtubeIdFromUrl, urlFromYoutubeId } from '$lib/external/youtube.ts';
  import { appleMusicTrackIdFromUrl, urlFromAppleMusicId } from '$lib/external/appleMusic.ts';
  import { validBandcampUrl } from '$lib/external/bandcamp.ts';

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
      const spotifyItem = await getSpotifyTrack(item.content.attributes['spotify.com']);
      item = { ...item, ...spotifyItem, id: item.id };
    }
  }

  function addFile(files: FileList | undefined) {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      if (files !== undefined && files.length === 1) {
        item.content.attributes.file = files[0].name;
      }
    }
  }

  function removeFile() {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      delete item.content.attributes.file;
    }
  }

  function addSpotify(spotifyTrackLink: string) {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      const spotifyTrackId = spotifyTrackIdFromUrl(spotifyTrackLink);
      if (spotifyTrackId) {
        item.content.attributes['spotify.com'] = spotifyTrackId;
      }
    }
  }

  function removeSpotify() {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      delete item.content.attributes['spotify.com'];
    }
  }

  function addAppleMusic(appleMusicTrackLink: string) {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      const appleMusicTrackId = appleMusicTrackIdFromUrl(appleMusicTrackLink);
      if (appleMusicTrackId) {
        item.content.attributes['music.apple.com'] = appleMusicTrackId;
      }
    }
  }

  function removeAppleMusic() {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      delete item.content.attributes['music.apple.com'];
    }
  }

  function addYoutube(youtubeLink: string) {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      const youtubeId = youtubeIdFromUrl(youtubeLink);
      if (youtubeId) {
        item.content.attributes['youtube.com'] = youtubeId;
      }
    }
  }

  function removeYoutube() {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      delete item.content.attributes['youtube.com'];
    }
  }

  function addBandcamp(bandcampLink: string) {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      if (validBandcampUrl(bandcampLink)) {
        item.content.attributes['bandcamp.com'] = bandcampLink;
      }
    }
  }

  function removeBandcamp() {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      delete item.content.attributes['bandcamp.com'];
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

      <div class="button-group tag-switch-buttons">
        <button
          class="button"
          class:inverted={item.tag === 'Song'}
          disabled={item.tag === 'Song'}
          onclick={convertToSong}
        >
          <i class="bi-music-note" aria-hidden="true"></i>
          Song
        </button>
        <button
          class="button"
          class:inverted={item.tag === 'AirBreak' || item.tag === 'AirBreakWithBackgroundMusic'}
          disabled={item.tag === 'AirBreak' || item.tag === 'AirBreakWithBackgroundMusic'}
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
            <div class="input-block-item">
              <button
                class="button"
                class:disabled={!('spotify.com' in item.content.attributes)}
                disabled={!('spotify.com' in item.content.attributes)}
                onclick={fillFromSpotify}
              >
                <i class="bi-spotify" aria-hidden="true"></i>
                Get metadata from Spotify
              </button>

              {#if !('spotify.com' in item.content.attributes)}
                <div class="hint">Add a Spotify track link below to enable</div>
              {/if}
            </div>

            <div class="padding-between-metadata-and-notes"></div>
          {/if}

          <div class="input-block-item">
            <label class="label" for="notes">Notes</label>
            <textarea class="input-text" id="notes" rows="10" bind:value={item.notes}></textarea>
          </div>

          {#if item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic'}
            <div class="input-block-header">Attributes</div>
            <div class="input-block-item">
              <FileAttribute
                attribute={item.content.attributes.file}
                onadd={addFile}
                onremove={removeFile}
              >
                <i class="bi-file-earmark" aria-hidden="true"></i>
                Audio file
              </FileAttribute>

              <LinkAttribute
                attribute={item.content.attributes['spotify.com']}
                urlFromAttribute={urlFromSpotifyTrackId}
                onadd={addSpotify}
                onremove={removeSpotify}
              >
                <i class="bi-spotify" aria-hidden="true"></i>
                Spotify track link
              </LinkAttribute>

              <LinkAttribute
                attribute={item.content.attributes['music.apple.com']}
                urlFromAttribute={urlFromAppleMusicId}
                onadd={addAppleMusic}
                onremove={removeAppleMusic}
              >
                <i class="bi-apple" aria-hidden="true"></i>
                Apple Music track link
              </LinkAttribute>

              <LinkAttribute
                attribute={item.content.attributes['youtube.com']}
                urlFromAttribute={urlFromYoutubeId}
                onadd={addYoutube}
                onremove={removeYoutube}
              >
                <i class="bi-youtube" aria-hidden="true"></i>
                YouTube link
              </LinkAttribute>

              <LinkAttribute
                attribute={item.content.attributes['bandcamp.com']}
                urlFromAttribute={(x: string) => x}
                onadd={addBandcamp}
                onremove={removeBandcamp}
              >
                Bandcamp link
              </LinkAttribute>
            </div>

            <div class="input-block-header">Search</div>
            <div class="input-block-item">
              <ul class="search-list">
                {#each $searchProviders as searchProvider (searchProvider.id)}
                  <li class="search-list-item">
                    <a
                      href={searchUrl(item.content, searchProvider.url)}
                      target="_blank"
                      rel="external"
                    >
                      <i class="bi-search" aria-hidden="true"></i>
                      Search with {searchProvider.name}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';
  @import '$lib/style/panel.css';

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

  .input-block-header {
    padding-top: 20px;
    padding-bottom: 20px;

    font-size: 1.2em;
    font-weight: bold;
  }

  .hint {
    padding-bottom: 10px;

    font-size: 0.85em;
    color: #666;
  }

  .padding-between-metadata-and-notes {
    padding-bottom: 30px;
  }

  .search-list {
    list-style: none;
    padding: 0px;
    margin: 0px;
  }

  .search-list-item {
    padding-top: 5px;
    padding-bottom: 5px;
  }
</style>
