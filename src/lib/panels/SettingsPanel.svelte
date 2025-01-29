<script lang="ts">
  import SearchProviders from './settings/SearchProviders.svelte';
  import QuickSearchProvider from './settings/QuickSearchProvider.svelte';

  import { spotifyClientId, spotifyClientSecret } from '$lib/settings.ts';

  interface Props {
    close: () => void;
  }

  let { close }: Props = $props();
</script>

<div class="outer-container">
  <div class="inner-container more-padding overflow">
    <div class="header">
      <h1 class="title">Settings</h1>

      <button class="button transparent close" onclick={close}>
        <i class="bi-x-lg" aria-hidden="true"></i>
        <span class="visually-hidden">Close settings</span>
      </button>
    </div>

    <p>Settings are stored locally in your browser.</p>

    <section>
      <h2>Search</h2>
      <p>Search for track title and artist on external services to get links and IDs for tracks.</p>

      <h3>Search providers</h3>
      <SearchProviders />

      <h3>Quick search</h3>
      <p>
        Search for items quickly using the
        <button class="button" disabled>
          <i class="bi-search" aria-hidden="true"></i>
          <span class="visually-hidden">Search</span>
        </button>
        button in a playlist
      </p>
      <QuickSearchProvider />
    </section>

    <section>
      <h2>Integrations</h2>

      <p>
        Integrations fetch track metadata from external sources using IDs of the respective metadata
        sources. The IDs can be found using search providers.
      </p>

      <h3>Spotify</h3>

      <div class="input-block">
        <label class="label" for="spotify-client-id">Client ID</label>
        <input
          class="input-text"
          id="spotify-client-id"
          type="text"
          bind:value={$spotifyClientId}
        />

        <label class="label" for="spotify-client-secret">Client Secret</label>
        <input
          class="input-text"
          id="spotify-client-secret"
          type="text"
          bind:value={$spotifyClientSecret}
        />
      </div>
    </section>
  </div>
</div>

<style>
  @import '$lib/style/a11y.css';
  @import '$lib/style/forms.css';
  @import '$lib/style/panel.css';

  .input-block {
    display: flex;
    flex-direction: column;
  }
</style>
