<script lang="ts">
  import { env } from '$env/dynamic/public';
  import {
    apiToken,
    apiTokenClaims,
    redirectToSSOAuthorize,
    redirectToSSOLogout
  } from '$lib/editor/external/auth/api';

  let showMenu = $state(false);
  let username = $derived($apiTokenClaims && $apiTokenClaims.name);

  function toggleMenu() {
    showMenu = !showMenu;
  }
</script>

{#if $apiToken}
  <div class="dropdown-container">
    <button class="button transparent" class:inverted={showMenu} onclick={toggleMenu}>
      <i class="bi-person" aria-hidden="true"></i> Account
    </button>

    {#if showMenu}
      <div class="dropdown-menu">
        <div class="avatar">
          <i class="bi-person" aria-hidden="true"></i>
        </div>
        <div class="username">
          {username}
        </div>

        <a href={env.PUBLIC_ACCOUNT_MANAGER_URL} class="button transparent align-left">
          <i class="bi-person" aria-hidden="true"></i> Manage account
        </a>
        <button class="button transparent align-left" onclick={redirectToSSOLogout}>
          <i class="bi-box-arrow-right" aria-hidden="true"></i> Sign out
        </button>
      </div>
    {/if}
  </div>
{:else}
  <button class="button transparent" onclick={redirectToSSOAuthorize}>
    <i class="bi-box-arrow-in-right" aria-hidden="true"></i> Sign in
  </button>
{/if}

<style>
  @import '$lib/style/forms.css';
  @import '$lib/style/dropdown.css';

  .dropdown-menu {
    min-width: 200px;
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
