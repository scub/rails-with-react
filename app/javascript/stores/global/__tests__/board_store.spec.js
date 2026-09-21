import { beforeEach, describe, expect, it } from 'vitest';

import { boardStore, hydrateBoardStore } from '../board_store';

describe('boardStore', () => {
  beforeEach(() => {
    boardStore.boardId = null;
    boardStore.realtimeToken = null;
    boardStore.authenticated = false;
    boardStore.securityToken = null;
  });

  describe('hydrateBoardStore', () => {
    it('copies the boot-time props into the proxy', () => {
      hydrateBoardStore({
        board_id: 42,
        realtime_token: 'rt-abc',
        authenticated: true,
        security_token: 'sec-123',
      });

      expect(boardStore).toMatchObject({
        boardId: 42,
        realtimeToken: 'rt-abc',
        authenticated: true,
        securityToken: 'sec-123',
      });
    });

    it('overwrites any previously hydrated values', () => {
      hydrateBoardStore({ board_id: 1, realtime_token: 'rt-1' });
      hydrateBoardStore({ board_id: 2, realtime_token: 'rt-2' });

      expect(boardStore.boardId).toBe(2);
      expect(boardStore.realtimeToken).toBe('rt-2');
    });
  });
});
