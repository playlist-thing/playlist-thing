<script lang="ts">
  import { exportSettings, importSettings } from '$lib/editor/settings.ts';

  let files: FileList | undefined = $state();

  $effect(() => {
    if (files !== undefined && files.length === 1) {
      importSettings(files[0]);
    }
  });
</script>

<h3>Export</h3>

<div class="input-block">
  <button class="button" onclick={exportSettings}>
    <i class="bi-box-arrow-up-right" aria-hidden="true"></i>
    Export settings
  </button>
</div>

<h3>Import</h3>

<p><strong>Warning: this will overwrite all current settings.</strong></p>

<div class="input-block">
  <label class="button" for="import-file">
    <i class="bi-box-arrow-in-down-right" aria-hidden="true"></i>
    Import settings file
  </label>
  <input class="file-input" accept="application/json" id="import-file" type="file" bind:files />
</div>

<style>
  @import '$lib/style/forms.css';

  .input-block {
    display: flex;
    flex-direction: column;
  }

  .file-input {
    opacity: 0;
  }
</style>
