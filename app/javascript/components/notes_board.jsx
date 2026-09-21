import { useNotes } from 'hooks/use_notes';
import { useState } from 'react';

import { boardStore } from 'stores/global/board_store';
import { useSnapshot } from 'valtio';

function NotesBoard() {
  const { notes, pending, addNote } = useNotes();
  const { authenticated } = useSnapshot(boardStore);
  const [draft, setDraft] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    addNote(draft);
    setDraft('');
  }

  return (
    <>
      <div className='row justify-content-center mb-4'>
        <div className='col-md-8 col-lg-6'>
          <h1 className='h4 mb-3'>Sticky notes</h1>
          <div className='card shadow-sm'>
            <div className='card-body'>
              {authenticated ? (
                <form onSubmit={handleSubmit}>
                  <label htmlFor='note-content' className='form-label'>
                    New note
                  </label>
                  <div className='input-group'>
                    <input
                      id='note-content'
                      type='text'
                      className='form-control'
                      placeholder='Write a note…'
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                    />
                    <button type='submit' className='btn btn-primary' disabled={pending}>
                      Add note
                    </button>
                  </div>
                </form>
              ) : (
                <p className='text-muted'>Log in to add notes.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className='text-center text-muted fst-italic'>No notes yet — add the first one above.</p>
      ) : (
        <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3'>
          {notes.map((note) => (
            <div key={note.id} className='col'>
              <div className='card h-100 shadow-sm'>
                <div className='card-body'>
                  <p className='card-text'>{note.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default NotesBoard;
