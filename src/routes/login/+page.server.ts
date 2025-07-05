import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

const USERNAME = 'admin';      
const PASSWORD = 'NISMED1964';   

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const username = form.get('username');
    const password = form.get('password');

    if (username === USERNAME && password === PASSWORD) {
      cookies.set('session', 'valid', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: false, 
        maxAge: 60 * 60 * 24, 
      });

      throw redirect(303, '/dashboard');
    }

    return fail(401, { error: 'Invalid username or password' });
  }
};
