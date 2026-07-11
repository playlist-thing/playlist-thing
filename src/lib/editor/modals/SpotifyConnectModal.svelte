<script lang="ts">
  import Modal from '$lib/ui/Modal.svelte';

  import { modals } from '$lib/editor/state.svelte';
  import { redirectToSpotifyAuthorize } from '$lib/auth/spotify';
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
  .modal-text {
    padding-bottom: 20px;
  }
</style>
