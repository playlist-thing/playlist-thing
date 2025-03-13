import { redirect, error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { getToken } from '$lib/editor/external/auth/spotify.ts';

// We require access to sessionStorage for the code verifier and state
export const ssr = false;

export const load: PageLoad = async ({ url }) => {
  const urlParams = url.searchParams;

  const state = urlParams.get('state');
  if (state) {
    if (state === sessionStorage.getItem('spotifyState')) {
      sessionStorage.removeItem('spotifyState');
    } else {
      error(400, 'Invalid OAuth state');
    }
  } else {
    error(400, 'No OAuth state received from Spotify');
  }

  const spotifyError = urlParams.get('error');
  if (spotifyError) {
    error(400, `Error from Spotify: ${spotifyError}`);
  }

  const code = urlParams.get('code');
  if (code === null) {
    error(400, 'No code specified.');
  }

  try {
    await getToken(code);
  } catch (e) {
    if (e instanceof Error) {
      error(400, e.message);
    } else {
      error(500, 'Unknown error');
    }
  }

  redirect(302, '/editor');
};
