import { useState } from 'react';
import { useSnapshot } from 'valtio';

import { boardStore } from 'stores/global/board_store';
import { notesStore } from 'stores/notes_store';
import { fetchPost } from 'utils/fetch';

// Data-fetching/async logic lives here, not in the component — the component
// just renders the snapshot and calls addNote().
function useNotes() {
  const { notes } = useSnapshot(notesStore);
  const [pending, setPending] = useState(false);

  async function addNote(content) {
    setPending(true);
    try {
      // The REST call only confirms the write. The note itself arrives back
      // through the ActionCable broadcast in notes_store.js — including for
      // the tab that made this request.
      await fetchPost(`/api/v1/boards/${boardStore.boardId}/notes`, {
        internal: true,
        data: { note: { content } },
      });
    } finally {
      setPending(false);
    }
  }

  return { notes, pending, addNote };
}

export { useNotes };
