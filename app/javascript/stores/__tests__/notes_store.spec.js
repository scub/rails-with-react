import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@rails/actioncable', () => ({
  createConsumer: vi.fn(() => ({ subscriptions: { create: vi.fn() } })),
}));

import { boardStore } from '../global/board_store';
import { cableStore } from '../global/cable_store';
import { notesStore, seedNotesStore } from '../notes_store';

describe('notesStore', () => {
  beforeEach(() => {
    notesStore.notes = [];
    boardStore.boardId = null;
    cableStore.state.event = { event_type: '', message: {} };
  });

  describe('seedNotesStore', () => {
    it('replaces the note list with the boot-time notes', () => {
      seedNotesStore([{ id: 1, content: 'first' }]);

      expect(notesStore.notes).toEqual([{ id: 1, content: 'first' }]);
    });
  });

  describe('reacting to cable messages', () => {
    it('appends a note broadcast on the "notes" channel', async () => {
      cableStore.state.event = {
        event_type: 'message',
        message: { channel: 'notes', id: 2, content: 'second' },
      };
      // Valtio's subscribe() notifies listeners on a microtask, not synchronously.
      await Promise.resolve();

      expect(notesStore.notes).toEqual([{ channel: 'notes', id: 2, content: 'second' }]);
    });

    it('ignores messages tagged for a different channel', async () => {
      cableStore.state.event = {
        event_type: 'message',
        message: { channel: 'container', status: 'load' },
      };
      await Promise.resolve();

      expect(notesStore.notes).toEqual([]);
    });

    it('ignores the connection-open event, which carries no message', async () => {
      cableStore.state.event = { event_type: 'open', message: {} };
      await Promise.resolve();

      expect(notesStore.notes).toEqual([]);
    });

    it('ignores a note broadcast for a different board', async () => {
      boardStore.boardId = 1;

      cableStore.state.event = {
        event_type: 'message',
        message: { channel: 'notes', board_id: 2, id: 3, content: "someone else's board" },
      };
      await Promise.resolve();

      expect(notesStore.notes).toEqual([]);
    });

    it('accepts a note broadcast with no board_id tag', async () => {
      boardStore.boardId = 1;

      cableStore.state.event = {
        event_type: 'message',
        message: { channel: 'notes', id: 3, content: 'no board tag' },
      };
      await Promise.resolve();

      expect(notesStore.notes).toEqual([{ channel: 'notes', id: 3, content: 'no board tag' }]);
    });
  });
});
