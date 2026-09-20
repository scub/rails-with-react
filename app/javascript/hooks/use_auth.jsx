import { useState } from 'react';

import { fetcher, fetchPost } from 'utils/fetch';

function useAuth() {
  const [pending, setPending] = useState(false);

  async function submit(mode, { emailAddress, password, passwordConfirmation }) {
    setPending(true);
    try {
      const url = mode === 'signup' ? '/registrations' : '/session';
      await fetchPost(url, {
        internal: true,
        data: {
          email_address: emailAddress,
          password,
          ...(mode === 'signup' ? { password_confirmation: passwordConfirmation } : {}),
        }
      });
      window.location.reload();
    } catch (response) {
      const body = await response.json()
      throw new Error(body.error || (body.errors || []).join(', '));
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    await fetcher('/session', { method: 'DELETE', internal: true });
    window.location.reload();
  }

  return { submit, logout, pending };
}

export { useAuth };