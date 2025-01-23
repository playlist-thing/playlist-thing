<script>
  import { createEventDispatcher } from 'svelte';

  import SearchProviders from './settings/SearchProviders.svelte';

  import { spotifyClientId, spotifyClientSecret } from '$lib/settings.js';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }
</script>

<div class="outer-container">
  <div class="inner-container more-padding overflow">
    <div class="header">
      <h1 class="title">Settings</h1>

      <button class="button transparent close" onclick={close}>
        <i class="bi-x-lg"></i>
      </button>
    </div>

    Settings are stored locally in your browser.

    <h2>Search</h2>

    Search for track title and artist on external services to get links and IDs for tracks.

    <SearchProviders />

    <h2>Integrations</h2>

    Integrations fetch track metadata from external sources using IDs of the respective metadata
    sources. The IDs can be found using search providers.

    <h3>Spotify</h3>

    <div class="input-block">
      <label class="label" for="spotify-client-id">Client ID</label>
      <input class="input-text" id="spotify-client-id" type="text" bind:value={$spotifyClientId} />

      <label class="label" for="spotify-client-secret">Client Secret</label>
      <input
        class="input-text"
        id="spotify-client-secret"
        type="text"
        bind:value={$spotifyClientSecret}
      />
    </div>
  </div>
</div>

<style>
  @import '$lib/style/forms.css';
  @import '$lib/style/panel.css';

  .input-block {
    display: flex;
    flex-direction: column;
  }
</style>
