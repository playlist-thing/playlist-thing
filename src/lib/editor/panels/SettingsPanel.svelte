<script lang="ts">
  import { env } from '$env/dynamic/public';

  import Playlists from './settings/Playlists.svelte';
  import SearchProviders from './settings/SearchProviders.svelte';
  import QuickSearchProvider from './settings/QuickSearchProvider.svelte';
  import Spotify from './settings/Spotify.svelte';
  import ExportImport from './settings/ExportImport.svelte';

  interface Props {
    close: () => void;
  }

  let { close }: Props = $props();
</script>

<div class="outer-container">
  <div class="inner-container overflow">
    <div class="padding-container">
      <div class="panel-header">
        <h2 class="panel-title">Settings</h2>

        <button class="button transparent close" onclick={close}>
          <i class="bi-x-lg" aria-hidden="true"></i>
          <span class="visually-hidden">Close settings</span>
        </button>
      </div>

      <p>Settings are stored locally in your browser.</p>

      <section>
        <h3>Playlists</h3>
        <Playlists />
      </section>

      <section>
        <h3>Search</h3>
        <p>
          Search for track title and artist on external services to get links and IDs for tracks.
        </p>

        <h4>Search providers</h4>
        <SearchProviders />

        <h4>Quick search</h4>
        <p>
          Search for items quickly using the
          <button class="button" disabled>
            <i class="bi-search" aria-hidden="true"></i>
            <span class="visually-hidden">Search</span>
          </button>
          button of a playlist item
        </p>
        <QuickSearchProvider />
      </section>

      <section>
        <h3>Integrations</h3>

        <p>
          Integrations fetch track metadata from external sources using IDs of the respective
          metadata sources. The IDs can be found using search providers.
        </p>

        {#if env.PUBLIC_SPOTIFY_CLIENT_ID}
          <h4>Spotify</h4>
          <Spotify />
        {/if}
      </section>

      <section>
        <h3>Export and import</h3>

        <p>Save all settings to a file and restore them at a later point.</p>
        <ExportImport />
      </section>

      <section>
        <h3>About playlist-thing</h3>

        <ul class="links-bottom">
          <li class="links-bottom-item">
            <a
              href="https://github.com/playlist-thing/playlist-thing"
              rel="external"
              target="_blank"
            >
              <i class="bi-github" aria-hidden="true"></i>
              View source on GitHub
            </a>
          </li>

          <li class="links-bottom-item">
            <a
              href="https://github.com/playlist-thing/playlist-thing/issues/new"
              rel="external"
              target="_blank"
            >
              <i class="bi-bug-fill" aria-hidden="true"></i>
              Report bug or request feature
            </a>
          </li>

          {#if 'PUBLIC_PRIVACY_POLICY_URL' in env}
            <li class="links-bottom-item">
              <a href={env.PUBLIC_PRIVACY_POLICY_URL} rel="external" target="_blank">
                <i class="bi-lock" aria-hidden="true"></i>
                Privacy policy
              </a>
            </li>
          {/if}

          {#if 'PUBLIC_IMPRINT_URL' in env}
            <li class="links-bottom-item">
              <a href={env.PUBLIC_IMPRINT_URL} rel="external" target="_blank">
                <i class="bi-file-earmark-text" aria-hidden="true"></i>
                Imprint
              </a>
            </li>
          {/if}
        </ul>
      </section>
    </div>
  </div>
</div>

<style>
  .outer-container {
    max-width: 600px;
  }

  .links-bottom {
    list-style: none;
    padding: 0px;
  }

  .links-bottom-item {
    padding-top: 5px;
    padding-bottom: 5px;
  }
</style>
