import { redirect, error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { getToken } from '$lib/external/auth/spotify.ts';

// getToken requires access to localStorage for the code verifier
export const ssr = false;

export const load: PageLoad = async ({ url }) => {
  const urlParams = url.searchParams;
  if (urlParams.get('error')) {
    error(400, `Error from Spotify: ${urlParams.get('error')}`);
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

  redirect(302, '/');
};
