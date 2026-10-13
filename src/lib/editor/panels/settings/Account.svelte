<script lang="ts">
  import { env } from '$env/dynamic/public';

  import {
    apiToken,
    apiTokenClaims,
    redirectToSSOAuthorize,
    redirectToSSOLogout
  } from '$lib/auth/api';

  let username = $derived(
    typeof $apiTokenClaims?.preferred_username === 'string'
      ? $apiTokenClaims.preferred_username
      : 'Account'
  );
</script>

{#if $apiToken}
  <div class="account">
    <div class="avatar">
      {username.slice(0, 1).toUpperCase()}
    </div>
    <div class="username">
      {username}
    </div>
  </div>

  <div class="actions">
    <a href={env.PUBLIC_ACCOUNT_MANAGER_URL} rel="external" class="button">
      <i class="bi-person" aria-hidden="true"></i> Manage account
    </a>
    <button class="button" onclick={redirectToSSOLogout}>
      <i class="bi-box-arrow-right" aria-hidden="true"></i> Sign out
    </button>
  </div>
{:else}
  <button class="button" onclick={redirectToSSOAuthorize}>
    <i class="bi-box-arrow-in-right" aria-hidden="true"></i> Sign in
  </button>
{/if}

<style>
  .account {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .avatar {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 2em;
    height: 2em;
    border-radius: 50%;

    background-color: #333;
    color: #fff;
  }

  .username {
    font-weight: bold;
  }

  .actions {
    display: flex;
    gap: 4px;

    padding-top: 10px;
  }

  .actions > .button {
    width: 100%;
  }
</style>
