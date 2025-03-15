<script lang="ts">
  import Modal from '$lib/Modal.svelte';

  import { modals } from '$lib/editor/state.svelte.ts';
</script>

<Modal bind:showModal={modals.showAddFileErrorModal} title="Error adding file" buttonText="OK">
  Sorry, the file you provided could not be added to the playlist.
</Modal>
