<script lang="ts">
  import { spotifyClientId, spotifyClientSecret } from '$lib/settings.ts';
</script>

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

<style>
  @import '$lib/style/forms.css';

  .input-block {
    display: flex;
    flex-direction: column;
  }
</style>
