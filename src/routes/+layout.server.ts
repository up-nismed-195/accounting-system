import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const session = cookies.get('session');
  const isLoggedIn = session === 'valid';

  if (!isLoggedIn && url.pathname !== '/login') {
    throw redirect(303, '/login');
  }
  if (isLoggedIn && url.pathname === '/login') {
    throw redirect(303, '/dashboard');
  }

  return {};
};
