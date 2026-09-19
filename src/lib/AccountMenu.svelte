<script lang="ts">
  import { env } from '$env/dynamic/public';

  import { OutClick } from 'svelte-outclick';

  import {
    apiToken,
    apiTokenClaims,
    redirectToSSOAuthorize,
    redirectToSSOLogout
  } from '$lib/auth/api';

  let showMenu = $state(false);
  let accountButton: HTMLButtonElement | null = $state(null);
  let username = $derived(
    typeof $apiTokenClaims?.preferred_username === 'string'
      ? $apiTokenClaims.preferred_username
      : 'Account'
  );

  function toggleMenu() {
    showMenu = !showMenu;
  }
</script>

{#if $apiToken}
  <div class="dropdown-container">
    <button
      class="button transparent"
      class:inverted={showMenu}
      onclick={toggleMenu}
      bind:this={accountButton}
    >
      <div class="small-avatar">
        {username.slice(0, 1).toUpperCase()}
      </div>
      Account
    </button>

    {#if showMenu}
      <OutClick onOutClick={() => (showMenu = false)} excludeElements={accountButton}>
        <div class="dropdown-menu">
          <div class="avatar">
            <i class="bi-person" aria-hidden="true"></i>
          </div>
          <div class="username">
            {username}
          </div>

          <a
            href={env.PUBLIC_ACCOUNT_MANAGER_URL}
            rel="external"
            class="button transparent align-left"
          >
            <i class="bi-person" aria-hidden="true"></i> Manage account
          </a>
          <button class="button transparent align-left" onclick={redirectToSSOLogout}>
            <i class="bi-box-arrow-right" aria-hidden="true"></i> Sign out
          </button>
        </div>
      </OutClick>
    {/if}
  </div>
{:else}
  <button class="button transparent" onclick={redirectToSSOAuthorize}>
    <i class="bi-box-arrow-in-right" aria-hidden="true"></i> Sign in
  </button>
{/if}

<style>
  .dropdown-menu {
    min-width: 200px;
  }

  .small-avatar {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;

    background-color: #333;
    color: #fff;
  }

  .avatar {
    display: flex;
    justify-content: center;

    font-size: 3em;
  }

  .username {
    display: flex;
    justify-content: center;

    padding-bottom: 13px;
  }
</style>
