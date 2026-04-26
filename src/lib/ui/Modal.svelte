<script lang="ts">
  // https://svelte.dev/playground/modal?version=5.22.1

  import type { Snippet } from 'svelte';

  interface Props {
    showModal: boolean;
    title: string;
    children: Snippet;
    buttonText: string;
  }

  let { showModal = $bindable(), title, children, buttonText }: Props = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  $effect(() => {
    if (showModal) dialog!.showModal();
  });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  onclose={() => (showModal = false)}
  onclick={(e) => {
    if (e.target === dialog) dialog.close();
  }}
  class="modal"
>
  <div class="modal-content">
    <h1>
      {title}
    </h1>
    {@render children?.()}

    <div class="modal-footer">
      <!-- svelte-ignore a11y_autofocus -->
      <button autofocus onclick={() => dialog!.close()} class="button">{buttonText}</button>
    </div>
  </div>
</dialog>

<style>
  @import '$lib/style/forms.css';
  @import '$lib/style/modal.css';
</style>
