// src/routes/login/+page.server.ts

import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);

export const load: PageServerLoad = async ({ cookies }) => {
  const session = cookies.get('session');
  if (session === 'valid') throw redirect(303, '/dashboard');
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    const email = form.get('email')?.toString() || '';
    const password = form.get('password')?.toString() || '';

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.session) {
      const message =
        error?.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : error?.message || 'Login failed.';

      return fail(401, { error: message });
    }

    cookies.set('session', 'valid', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 60 * 60 * 24
    });

    throw redirect(303, '/dashboard');
  }
};
