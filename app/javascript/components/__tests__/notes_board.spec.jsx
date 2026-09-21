import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseNotes } = vi.hoisted(() => ({ mockUseNotes: vi.fn() }));

// Per convention, mock the hook rather than its dependencies (fetch, stores) —
// the component doesn't need to know how useNotes gets its data.
vi.mock('hooks/use_notes', () => ({ useNotes: mockUseNotes }));

import { boardStore } from 'stores/global/board_store';
import NotesBoard from '../notes_board';

describe('NotesBoard', () => {
  const addNote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    boardStore.authenticated = true;
    mockUseNotes.mockReturnValue({
      notes: [
        { id: 1, content: 'Buy milk' },
        { id: 2, content: 'Water the plants' },
      ],
      pending: false,
      addNote,
    });
  });

  it('renders every note from the hook', () => {
    render(<NotesBoard />);

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Water the plants')).toBeInTheDocument();
  });

  it('submits the typed draft and clears the input', async () => {
    const user = userEvent.setup();
    render(<NotesBoard />);

    const input = screen.getByLabelText('New note');
    await user.type(input, 'Ship the toy app');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(addNote).toHaveBeenCalledWith('Ship the toy app');
    expect(input).toHaveValue('');
  });

  it('does not submit a blank draft', async () => {
    const user = userEvent.setup();
    render(<NotesBoard />);

    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(addNote).not.toHaveBeenCalled();
  });

  it('disables the submit button while a request is pending', () => {
    mockUseNotes.mockReturnValue({ notes: [], pending: true, addNote });

    render(<NotesBoard />);

    expect(screen.getByRole('button', { name: 'Add note' })).toBeDisabled();
  });

  it('shows a login prompt instead of the form when logged out', () => {
    boardStore.authenticated = false;

    render(<NotesBoard />);

    expect(screen.queryByLabelText('New note')).not.toBeInTheDocument();
    expect(screen.getByText('Log in to add notes.')).toBeInTheDocument();
  });
});
