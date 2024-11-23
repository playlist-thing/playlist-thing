<script>
  import { hideSettings } from '$lib/state.js';
  import { spotifyClientId, spotifyClientSecret } from '$lib/settings.js';
</script>

<div class="outer-container">
  <div class="inner-container">
    <div class="header">
      <h1 class="title">Settings</h1>

      <button class="button transparent close" on:click={hideSettings}>
        <i class="bi-x-lg" />
      </button>
    </div>

    <h2>Integrations</h2>

    <h3>Spotify</h3>

    <div>
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

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.2em;
  }

  .title {
    margin: 0px;
  }

  .button.close {
    font-size: 2em;
    padding: 0px;
  }

  .input-block-group {
    display: flex;
  }

  .input-block {
    display: flex;
    flex-direction: column;
  }
</style>
