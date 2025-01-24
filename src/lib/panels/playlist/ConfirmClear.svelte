<script>
  let { cancel, clear } = $props();
</script>

<div class="outer-modal">
  <div>
    Really clear playlist?

    <div class="modal-buttons">
      <button class="button" onclick={cancel}> Cancel </button>
      <button class="button" onclick={clear}> Clear </button>
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
