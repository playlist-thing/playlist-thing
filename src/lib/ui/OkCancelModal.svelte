<script lang="ts">
  // https://svelte.dev/playground/modal?version=5.22.1

  import type { Snippet } from 'svelte';

  interface Props {
    showModal: boolean;
    title: string;
    children: Snippet;
    buttonCancelText: string;
    buttonOkText: string;
    onOk: () => void;
  }

  let {
    showModal = $bindable(),
    title,
    children,
    buttonCancelText,
    buttonOkText,
    onOk
  }: Props = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  $effect(() => {
    if (showModal) dialog!.showModal();
  });

  function ok() {
    onOk();
    dialog!.close();
  }
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
      <button autofocus onclick={ok} class="button ok">{buttonOkText}</button>
      <button onclick={() => dialog!.close()} class="button">{buttonCancelText}</button>
    </div>
  </div>
</dialog>

<style>
  @import '$lib/style/forms.css';
  @import '$lib/style/modal.css';

  .button.ok {
    margin-right: 5px;
  }
</style>
