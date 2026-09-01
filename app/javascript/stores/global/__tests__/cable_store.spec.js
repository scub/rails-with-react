import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSubscriptionCreate, mockConsumer } = vi.hoisted(() => {
  const mockSubscriptionCreate = vi.fn();
  return {
    mockSubscriptionCreate,
    mockConsumer: { subscriptions: { create: mockSubscriptionCreate } },
  };
});

vi.mock('@rails/actioncable', () => ({
  createConsumer: vi.fn(() => mockConsumer),
}));

import { createConsumer } from '@rails/actioncable';

// The module keeps a singleton `consumer` so it only connects once. Get a
// fresh module instance per test so each test controls its own connection.
async function freshCableStore() {
  vi.resetModules();
  return import('../cable_store');
}

describe('cableStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.root_url = '';
  });

  describe('connectToCable', () => {
    it('does nothing without a realtime token', async () => {
      const { connectToCable } = await freshCableStore();

      connectToCable(null);

      expect(createConsumer).not.toHaveBeenCalled();
    });

    it('subscribes to RealtimeChannel with the given token', async () => {
      const { connectToCable } = await freshCableStore();

      connectToCable('board-token-1');

      expect(mockSubscriptionCreate).toHaveBeenCalledWith(
        { channel: 'RealtimeChannel', realtime_token: 'board-token-1' },
        expect.objectContaining({ connected: expect.any(Function), received: expect.any(Function) })
      );
    });

    it('connects only once even if called again', async () => {
      const { connectToCable } = await freshCableStore();

      connectToCable('board-token-1');
      connectToCable('board-token-2');

      expect(createConsumer).toHaveBeenCalledTimes(1);
    });

    it('sets an "open" event on connect', async () => {
      const { cableStore, connectToCable } = await freshCableStore();

      connectToCable('board-token-1');
      const { connected } = mockSubscriptionCreate.mock.calls[0][1];
      connected();

      expect(cableStore.state.event).toEqual({ event_type: 'open', message: {} });
    });

    it('overwrites the mailbox slot with the latest message on receive', async () => {
      const { cableStore, connectToCable } = await freshCableStore();

      connectToCable('board-token-1');
      const { received } = mockSubscriptionCreate.mock.calls[0][1];

      received({ channel: 'notes', id: 1, content: 'first' });
      received({ channel: 'notes', id: 2, content: 'second' });

      expect(cableStore.state.event).toEqual({
        event_type: 'message',
        message: { channel: 'notes', id: 2, content: 'second' },
      });
    });
  });
});
