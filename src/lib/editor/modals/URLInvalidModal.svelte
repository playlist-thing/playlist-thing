<script lang="ts">
  import Modal from '$lib/Modal.svelte';

  import { modals } from '$lib/editor/state.svelte.ts';
</script>

<Modal bind:showModal={modals.showURLInvalidModal} title="URL not recognized" buttonText="OK">
  Sorry, the URL you provided does not match any source supported by playlist-thing.
</Modal>
