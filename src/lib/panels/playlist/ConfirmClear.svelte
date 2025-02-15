<script lang="ts">
  interface Props {
    cancel: () => void;
    clear: () => void;
  }

  let { cancel, clear }: Props = $props();
</script>

<div class="outer-modal">
  <div>
    <div class="icon">
      <i class="bi-trash-fill"></i>
    </div>

    <div class="text">Are you sure you want to remove all playlist items?</div>

    <div class="modal-buttons">
      <button class="button" onclick={cancel}>Cancel</button>
      <button class="button danger" onclick={clear}>
        <i class="bi-trash-fill"></i>
        Clear
      </button>
    </div>
  </div>
</div>

<style>
  @import '$lib/style/forms.css';

  .outer-modal {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    height: 200px;
  }

  .icon {
    display: flex;
    justify-content: center;

    padding-bottom: 20px;

    font-size: 3em;
  }

  .text {
    padding-bottom: 20px;
  }

  .modal-buttons {
    display: flex;
    justify-content: space-between;

    padding-top: 15px;
  }
</style>
