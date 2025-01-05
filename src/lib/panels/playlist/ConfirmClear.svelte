<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function cancel() {
    dispatch('cancel');
  }

  function clear() {
    dispatch('clear');
  }
</script>

<div class="outer-modal">
  <div>
    Really clear playlist?

    <div class="modal-buttons">
      <button class="button" on:click={cancel}> Cancel </button>
      <button class="button" on:click={clear}> Clear </button>
    </div>
  </div>
</div>

<style>
  @import '$lib/style/forms.css';

  .outer-modal {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .modal-buttons {
    display: flex;
    justify-content: space-between;

    padding-top: 15px;
  }
</style>
