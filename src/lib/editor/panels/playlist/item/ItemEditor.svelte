<script lang="ts">
  import FileAttribute from './editor/FileAttribute.svelte';
  import LinkAttribute from './editor/LinkAttribute.svelte';

  import type { PlaylistItem } from '$lib/schema/playlist';
  import { emptySongMetadata, applySongDetails } from '$lib/schema/playlist';
  import DurationInput from '$lib/ui/DurationInput.svelte';
  import { spotifyToken } from '$lib/auth/spotify';
  import { searchProviders } from '$lib/editor/settings';
  import { searchUrl } from '$lib/editor/search';
  import { modals } from '$lib/editor/state.svelte';
  import {
    spotifyTrackIdFromUrl,
    urlFromSpotifyTrackId,
    fetchSpotifyMetadata
  } from '$lib/editor/external/spotify';
  import { youtubeIdFromUrl, urlFromYoutubeId } from '$lib/editor/external/youtube';
  import { appleMusicTrackIdFromUrl, urlFromAppleMusicId } from '$lib/editor/external/appleMusic';
  import { validBandcampUrl } from '$lib/editor/external/bandcamp';

  interface Props {
    item: PlaylistItem;
  }

  let { item = $bindable() }: Props = $props();

  let componentId = $props.id();

  let activeTab = $state<'details' | 'links' | 'notes' | 'search'>('details');

  // Song and background music share the same metadata fields.
  let contentItem = $derived(
    item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic' ? item : null
  );

  let attributesCount = $derived(
    contentItem ? Object.keys(contentItem.content.attributes).length : 0
  );

  function addBackgroundMusic() {
    item = {
      id: item.id,
      seconds: item.seconds,
      internalNotes: item.internalNotes,
      publicNotes: item.publicNotes,

      tag: 'AirBreakWithBackgroundMusic',
      content: emptySongMetadata
    };
  }

  function removeBackgroundMusic() {
    item = {
      id: item.id,
      seconds: item.seconds,
      internalNotes: item.internalNotes,
      publicNotes: item.publicNotes,

      tag: 'AirBreak'
    };
  }

  async function fillFromSpotify() {
    if (item.tag === 'Song' || item.tag === 'AirBreakWithBackgroundMusic') {
      if (!$spotifyToken) {
        modals.showSpotifyConnectModal = true;
        return;
      }

      const details = await fetchSpotifyMetadata(item.content.attributes['spotify.com']);
      applySongDetails(item, details);
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

<div class="editor">
  {#if item.tag === 'AirBreakWithBackgroundMusic'}
    <div class="background-music-header">
      <span class="background-music-title">Background music</span>
      <button class="button transparent" onclick={removeBackgroundMusic}>
        <i class="bi-trash" aria-hidden="true"></i>
        Remove
      </button>
    </div>
  {/if}

  <div class="core">
    <div class="field duration">
      <label class="label" for={`duration-${componentId}`}>Duration</label>
      <DurationInput
        id={`duration-${componentId}`}
        value={item.seconds}
        onNewValue={(seconds) => (item.seconds = seconds)}
      />
    </div>

    {#if contentItem}
      <div class="field">
        <label class="label" for={`title-${componentId}`}>Title</label>
        <input
          class="input-text"
          id={`title-${componentId}`}
          type="text"
          bind:value={contentItem.content.title}
        />
      </div>

      <div class="field">
        <label class="label" for={`artist-${componentId}`}>Artist</label>
        <input
          class="input-text"
          id={`artist-${componentId}`}
          type="text"
          bind:value={contentItem.content.artist}
        />
      </div>
    {:else}
      <div class="core-action">
        <button class="button" onclick={addBackgroundMusic}>
          <i class="bi-music-note" aria-hidden="true"></i>
          Add background music
        </button>
      </div>
    {/if}
  </div>

  {#if contentItem}
    <div class="tabs" role="tablist">
      <button
        class="tab"
        class:active={activeTab === 'details'}
        role="tab"
        aria-selected={activeTab === 'details'}
        onclick={() => (activeTab = 'details')}
      >
        Details
      </button>

      <button
        class="tab"
        class:active={activeTab === 'links'}
        role="tab"
        aria-selected={activeTab === 'links'}
        onclick={() => (activeTab = 'links')}
      >
        Links
        {#if attributesCount > 0}
          <span class="tab-badge">{attributesCount}</span>
        {/if}
      </button>

      <button
        class="tab"
        class:active={activeTab === 'notes'}
        role="tab"
        aria-selected={activeTab === 'notes'}
        onclick={() => (activeTab = 'notes')}
      >
        Notes
      </button>

      <button
        class="tab"
        class:active={activeTab === 'search'}
        role="tab"
        aria-selected={activeTab === 'search'}
        onclick={() => (activeTab = 'search')}
      >
        Search
      </button>
    </div>

    <div class="tab-panel" role="tabpanel">
      {#if activeTab === 'details'}
        <div class="details">
          <div class="field">
            <label class="label" for={`album-${componentId}`}>Album</label>
            <input
              class="input-text"
              id={`album-${componentId}`}
              type="text"
              bind:value={contentItem.content.album}
            />
          </div>

          <div class="details-grid">
            <div class="field">
              <label class="label" for={`released-${componentId}`}>Released</label>
              <input
                class="input-text"
                id={`released-${componentId}`}
                type="text"
                bind:value={contentItem.content.released}
              />
            </div>

            <div class="field">
              <label class="label" for={`label-${componentId}`}>Label</label>
              <input
                class="input-text"
                id={`label-${componentId}`}
                type="text"
                bind:value={contentItem.content.label}
              />
            </div>
          </div>

          <button
            class="button align-left"
            class:disabled={!('spotify.com' in contentItem.content.attributes)}
            disabled={!('spotify.com' in contentItem.content.attributes)}
            onclick={fillFromSpotify}
          >
            <i class="bi-spotify" aria-hidden="true"></i>
            Get metadata from Spotify
          </button>

          {#if !('spotify.com' in contentItem.content.attributes)}
            <p class="hint">Add a Spotify track link in the Links tab to enable</p>
          {/if}
        </div>
      {:else if activeTab === 'links'}
        <div class="links">
          <div class="attributes">
            <FileAttribute
              attribute={contentItem.content.attributes.file}
              onadd={addFile}
              onremove={removeFile}
            >
              <i class="bi-file-earmark" aria-hidden="true"></i>
              Audio file
            </FileAttribute>

            <LinkAttribute
              attribute={contentItem.content.attributes['spotify.com']}
              urlFromAttribute={urlFromSpotifyTrackId}
              onadd={addSpotify}
              onremove={removeSpotify}
            >
              <i class="bi-spotify" aria-hidden="true"></i>
              Spotify track link
            </LinkAttribute>

            <LinkAttribute
              attribute={contentItem.content.attributes['music.apple.com']}
              urlFromAttribute={urlFromAppleMusicId}
              onadd={addAppleMusic}
              onremove={removeAppleMusic}
            >
              <i class="bi-apple" aria-hidden="true"></i>
              Apple Music track link
            </LinkAttribute>

            <LinkAttribute
              attribute={contentItem.content.attributes['youtube.com']}
              urlFromAttribute={urlFromYoutubeId}
              onadd={addYoutube}
              onremove={removeYoutube}
            >
              <i class="bi-youtube" aria-hidden="true"></i>
              YouTube link
            </LinkAttribute>

            <LinkAttribute
              attribute={contentItem.content.attributes['bandcamp.com']}
              urlFromAttribute={(x: string) => x}
              onadd={addBandcamp}
              onremove={removeBandcamp}
            >
              Bandcamp link
            </LinkAttribute>
          </div>
        </div>
      {:else if activeTab === 'notes'}
        <div class="notes">
          <div class="field">
            <label class="label" for={`internal-notes-${componentId}`}>Internal notes</label>
            <textarea
              class="input-text"
              id={`internal-notes-${componentId}`}
              rows="3"
              bind:value={item.internalNotes}></textarea>
          </div>

          <div class="field">
            <label class="label" for={`public-notes-${componentId}`}>Public notes</label>
            <textarea
              class="input-text"
              id={`public-notes-${componentId}`}
              rows="3"
              bind:value={item.publicNotes}></textarea>
          </div>
        </div>
      {:else}
        <div class="search-block">
          <span class="group-title">Search this song</span>
          <div class="search-links">
            {#each $searchProviders as searchProvider (searchProvider.id)}
              <a
                class="button transparent"
                href={searchUrl(contentItem.content, searchProvider.url)}
                target="_blank"
                rel="external"
              >
                <i class="bi-search" aria-hidden="true"></i>
                {searchProvider.name}
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="solo-notes">
      <span class="group-title">Notes</span>

      <div class="field">
        <label class="label" for={`internal-notes-${componentId}`}>Internal notes</label>
        <textarea
          class="input-text"
          id={`internal-notes-${componentId}`}
          rows="3"
          bind:value={item.internalNotes}></textarea>
      </div>

      <div class="field">
        <label class="label" for={`public-notes-${componentId}`}>Public notes</label>
        <textarea
          class="input-text"
          id={`public-notes-${componentId}`}
          rows="3"
          bind:value={item.publicNotes}></textarea>
      </div>
    </div>
  {/if}
</div>

<style>
  .editor {
    container-type: inline-size;

    display: flex;
    flex-direction: column;
    gap: 0;

    padding: 14px 16px 16px;
    margin: 6px 12px 10px;

    background-color: #f7f7f7;
    border-radius: 8px;
    color: var(--text-color);
  }

  .background-music-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding-bottom: 10px;
  }

  .background-music-title {
    font-size: 1.1em;
    font-weight: 600;
  }

  .core {
    display: flex;
    gap: 10px;

    padding-bottom: 14px;
  }

  .core .field {
    flex: 1 1 0;
    min-width: 0;
  }

  .core .field.duration {
    flex: 0 0 auto;
    width: 100px;
  }

  .core-action {
    display: flex;
    align-items: flex-end;
    margin-left: auto;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .field .label {
    color: #555;
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    border-bottom: 1px solid #e2e2e2;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 8px 12px;
    margin-bottom: -1px;

    background: none;
    border: 0;
    border-bottom: 2px solid transparent;

    font: inherit;
    color: #666;

    cursor: pointer;
  }

  .tab.active {
    color: var(--text-color);
    font-weight: 600;
    border-bottom-color: var(--text-color);
  }

  .tab-badge {
    min-width: 1.4em;
    padding: 0 5px;

    background-color: #e2e2e2;
    border-radius: 999px;

    font-size: 0.75em;
    font-weight: 600;
    text-align: center;
  }

  .tab-panel {
    padding-top: 14px;
  }

  .details,
  .notes,
  .solo-notes,
  .search-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .details-grid {
    display: flex;
    gap: 10px;
  }

  .details-grid .field {
    flex: 1 1 0;
    min-width: 0;
  }

  .details .button {
    align-self: flex-start;
  }

  .hint {
    margin: 0;

    font-size: 0.85em;
    color: #666;
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .group-title {
    font-size: 0.75em;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #777;
  }

  .attributes {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .search-links {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  /* Switch to the stacked layout based on the editor's own width, so it also
     works when a panel is narrow (e.g. the double playlist view). */
  @container (max-width: 500px) {
    .core {
      flex-direction: column;
    }

    .core .field.duration {
      width: auto;
    }

    .core-action {
      align-self: stretch;
      width: 100%;
    }

    .core-action .button {
      width: 100%;
    }

    .details-grid {
      flex-direction: column;
    }
  }
</style>
