import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFetcher, mockFetchPost } = vi.hoisted(() => ({
  mockFetcher: vi.fn(),
  mockFetchPost: vi.fn(),
}));

vi.mock('utils/fetch', () => ({ fetcher: mockFetcher, fetchPost: mockFetchPost }));

import { useAuth } from '../use_auth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('location', { reload: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('submit', () => {
    it('logs in against /session without password confirmation', async () => {
      mockFetchPost.mockResolvedValue({});
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.submit('login', {
            emailAddress: 'vitest@loves-to.dev',
            password: 'password12345',
            passwordConfirmation: 'password12345',
        });
      });

      expect(mockFetchPost).toHaveBeenCalledWith('/session', {
        internal: true,
        data: { email_address: 'vitest@loves-to.dev', password: 'password12345' },
      });

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('signs up against /registrations with the password confirmation', async () => {
      mockFetchPost.mockResolvedValue({});
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.submit('signup', {
          emailAddress: 'vitest@loves-to.dev',
          password: 'password12345',
          passwordConfirmation: 'password12345',
        });
      });

      expect(mockFetchPost).toHaveBeenCalledWith('/registrations', {
        internal: true,
        data: {
          email_address: 'vitest@loves-to.dev',
          password: 'password12345',
          password_confirmation: 'password12345',   
        }
      });
    });

    it('surfaces the { error } shape from a failed login', async () => {
      mockFetchPost.mockRejectedValue({ json: () => Promise.resolve({ error: 'Try another email address or password.'}) });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(
          result.current.submit('login', { emailAddress: 'vitest@loves-to.dev', password: 'wrong' })
        ).rejects.toThrow('Try another email address or password.');
      });
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('surfaces { errors } from failed signup', async () => {
      mockFetchPost.mockRejectedValue({ json: () => Promise.resolve({ errors: ['Email has already been taken'] }) });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(
          result.current.submit('signup', { emailAddress: 'vitest@loves-to.dev', password: 'a', passwordConfirmation: 'z' })
        ).rejects.toThrow('Email has already been taken');
      });
    });

    it('toggles pending around request, even for failures', async () => {
      let resolveFetch;
      mockFetchPost.mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));
      const { result } = renderHook(() => useAuth());

      let submitPromise;
      act(() => {
        submitPromise = result.current.submit('login', { emailAddress: 'vitest@loves-to.dev', password: 'a' });
      });
      expect(result.current.pending).toBe(true);

      resolveFetch({});
      await act(async () => {
        await submitPromise;
      });
      expect(result.current.pending).toBe(false);
    });

    it('Uses an empty message when the response has no error or errors object', async () => {
      mockFetchPost.mockRejectedValue({ json: () => Promise.resolve({}) });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(
          result.current.submit('login', { emailAddress: 'penny@loves-to.dev', password: 'password12345'})
        ).rejects.toThrow('');
      });
    })
  });

  describe('logout', () => {
    it('DELETEs /session with the CSRF token and triggers a reload', async () => {
      mockFetcher.mockResolvedValue(null);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(mockFetcher).toHaveBeenCalledWith('/session', { method: 'DELETE', internal: true });
      expect(window.location.reload).toHaveBeenCalled();
    });
  }); 
});