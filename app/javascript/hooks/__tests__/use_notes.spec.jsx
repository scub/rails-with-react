import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFetchPost } = vi.hoisted(() => ({ mockFetchPost: vi.fn() }));

vi.mock('utils/fetch', () => ({ fetchPost: mockFetchPost }));

import { boardStore } from 'stores/global/board_store';
import { notesStore } from 'stores/notes_store';
import { useNotes } from '../use_notes';

describe('useNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    boardStore.boardId = 7;
    notesStore.notes = [{ id: 1, content: 'existing note' }];
  });

  it('returns the current notes from the store', () => {
    const { result } = renderHook(() => useNotes());

    expect(result.current.notes).toEqual([{ id: 1, content: 'existing note' }]);
  });

  describe('addNote', () => {
    it('POSTs the note to the current board, with the CSRF token attached', async () => {
      mockFetchPost.mockResolvedValue({ id: 2, content: 'new note' });
      const { result } = renderHook(() => useNotes());

      await act(async () => {
        await result.current.addNote('new note');
      });

      expect(mockFetchPost).toHaveBeenCalledWith('/api/v1/boards/7/notes', {
        internal: true,
        data: { note: { content: 'new note' } },
      });
    });

    it('toggles pending while the request is in flight', async () => {
      let resolveFetch;
      mockFetchPost.mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));
      const { result } = renderHook(() => useNotes());

      let addNotePromise;
      act(() => {
        addNotePromise = result.current.addNote('new note');
      });
      expect(result.current.pending).toBe(true);

      resolveFetch({ id: 2, content: 'new note' });
      await act(async () => {
        await addNotePromise;
      });

      expect(result.current.pending).toBe(false);
    });

    it('clears pending even when the request fails', async () => {
      mockFetchPost.mockRejectedValue(new Error('network down'));
      const { result } = renderHook(() => useNotes());

      await act(async () => {
        await expect(result.current.addNote('new note')).rejects.toThrow('network down');
      });

      await waitFor(() => expect(result.current.pending).toBe(false));
    });
  });
});
