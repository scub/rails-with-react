import { proxy, subscribe } from 'valtio';

import { cableStore } from 'stores/global/cable_store';
import { boardStore } from 'stores/global/board_store';

// A domain store, distinct from the raw cable mailbox: it folds cable events
// into its own shape (a note list), so components never touch the socket
// payload directly. Seeded from the boot blob, then appended to over the
// wire — the same split as the real app's container_store.js.
const notesStore = proxy({ notes: [] });

function seedNotesStore(initialNotes) {
  notesStore.notes = initialNotes;
}

// Registered at module scope, not inside a component — this store reacts to
// new notes even if no NotesBoard is currently mounted.
subscribe(cableStore.state, () => {
  const { event_type, message } = cableStore.state.event;
  if (event_type !== 'message' || message.channel !== 'notes') return;
  if (message.board_id && message.board_id !== boardStore.boardId) return;

  notesStore.notes = [...notesStore.notes, message];
});

export { notesStore, seedNotesStore };
