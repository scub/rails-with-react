import { proxy } from 'valtio';

// Populated exactly once, at boot, from the #application-data blob — the
// same one-way, one-time prop injection the real app uses (see
// entrypoints/application.jsx). Nothing here is ever re-fetched from Rails.
const boardStore = proxy({
  boardId: null,
  realtimeToken: null,
  currentUserName: null,
  securityToken: null,
});

function hydrateBoardStore(props) {
  boardStore.boardId = props.board_id;
  boardStore.realtimeToken = props.realtime_token;
  boardStore.currentUserName = props.current_user_name;
  boardStore.securityToken = props.security_token;
}

export { boardStore, hydrateBoardStore };
