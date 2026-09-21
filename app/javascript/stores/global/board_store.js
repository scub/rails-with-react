import { proxy } from 'valtio';

// Populated exactly once, at boot, from the #application-data blob.
// Nothing here is ever re-fetched from Rails.
const boardStore = proxy({
  boardId: null,
  realtimeToken: null,
  authenticated: false,
  securityToken: null,
});

function hydrateBoardStore(props) {
  boardStore.boardId = props.board_id;
  boardStore.realtimeToken = props.realtime_token;
  boardStore.authenticated = props.authenticated;
  boardStore.securityToken = props.security_token;
}

export { boardStore, hydrateBoardStore };
