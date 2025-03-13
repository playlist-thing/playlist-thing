<script lang="ts">
  import { spotifyToken, redirectToSpotifyAuthorize } from '$lib/editor/external/auth/spotify.ts';
</script>

<p>Your Spotify account connection is stored locally and is not shared with anybody else.</p>

<p>
  All requests to Spotify are made directly in your browser without going through playlist-thing
  servers.
</p>

<div class="input-block">
  <button class="button" onclick={redirectToSpotifyAuthorize}>
    <i class="bi-spotify"></i>
    {#if $spotifyToken}
      Switch Spotify account
    {:else}
      Connect Spotify account
    {/if}
  </button>
</div>

<style>
  @import '$lib/style/forms.css';

  .input-block {
    display: flex;
    flex-direction: column;
  }
</style>
