<script lang="ts">
  import Modal from '$lib/Modal.svelte';

  import { modals } from '$lib/editor/state.svelte.ts';
  import { redirectToSpotifyAuthorize } from '$lib/editor/external/auth/spotify.ts';
</script>

<Modal
  bind:showModal={modals.showSpotifyConnectModal}
  title="Connect your Spotify account"
  buttonText="Cancel"
>
  <div class="modal-text">A Spotify account connection is required for fetching track details.</div>

  <button class="button" onclick={redirectToSpotifyAuthorize}>
    <i class="bi-spotify"></i>
    Connect Spotify account
  </button>
</Modal>

<style>
  @import '$lib/style/forms.css';

  .modal-text {
    padding-bottom: 20px;
  }
</style>
