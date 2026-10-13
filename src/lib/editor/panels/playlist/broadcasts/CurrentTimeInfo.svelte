<script lang="ts">
  import { clock } from '$lib/clock';
</script>

<div>
  Your current timezone is
  <strong>{Intl.DateTimeFormat().resolvedOptions().timeZone}</strong>
</div>

<div>
  Your current time is
  <strong class="time">{new Date(clock.now).toLocaleString()}</strong>
</div>

<style>
  .time {
    font-variant-numeric: tabular-nums;
  }
</style>
