import { redirect, error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { getToken } from '$lib/editor/external/auth/spotify.ts';

// We require access to sessionStorage for the code verifier and state
export const ssr = false;

export const load: PageLoad = async ({ url }) => {
  try {
    await getToken(url);
  } catch (e) {
    if (e instanceof Error) {
      error(400, e.message);
    } else {
      error(500, 'Unknown error');
    }
  }

  redirect(302, '/editor');
};
