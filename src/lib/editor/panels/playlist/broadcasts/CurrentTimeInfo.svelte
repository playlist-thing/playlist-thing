<script lang="ts">
  import { clock } from '$lib/clock';
  import { timeZone } from '$lib/editor/settings';
  import { formatDateTime } from '$lib/format';

  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const currentTimeZone = $derived($timeZone ?? localTimeZone);
</script>

<div>
  Your current timezone is
  <strong>{currentTimeZone}</strong>
  {#if $timeZone === null}
    (local)
  {/if}
</div>

<div>
  Your current time is
  <strong class="time">{formatDateTime(clock.now, $timeZone)}</strong>
</div>

<style>
  .time {
    font-variant-numeric: tabular-nums;
  }
</style>
