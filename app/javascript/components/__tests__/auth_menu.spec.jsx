import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseAuth, mockSubmit, mockLogout } = vi.hoisted(() => {
  const mockSubmit = vi.fn();
  const mockLogout = vi.fn();
  return { mockUseAuth: vi.fn(), mockSubmit, mockLogout };
});

vi.mock('hooks/use_auth', () => ({ useAuth: mockUseAuth }));

import { boardStore } from 'stores/global/board_store';
import AuthMenu from '../auth_menu';

describe('AuthMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    boardStore.authenticated = false;
    mockUseAuth.mockReturnValue({ submit: mockSubmit, logout: mockLogout, pending: false });
  });

  it('shows the "Log in" option when logged out', async () => {
    const user = userEvent.setup();
    render(<AuthMenu />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));

    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
  });

  it('shows a "Log out" option when authenticated', async () => {
    boardStore.authenticated = true;
    const user = userEvent.setup();
    render(<AuthMenu />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));

    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('calls logout when "Log out" is clicked', async () => {
    boardStore.authenticated = true;
    const user = userEvent.setup();
    render(<AuthMenu />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(mockLogout).toHaveBeenCalled();
  });

  it('opens the login modal from the dropdown', async () => {
    const user = userEvent.setup();
    render(<AuthMenu />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm password')).not.toBeInTheDocument();
  });

  it('toggles the sign-up mode, revealing the confirm-password field', async () => {
    const user = userEvent.setup();
    render(<AuthMenu />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    await user.click(screen.getByRole('button', { name: 'Need an account? Sign up' }));

    expect(screen.getByRole('heading', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
  });

  it('submits the form with the entered creds', async () => {
    mockSubmit.mockResolvedValue();
    const user = userEvent.setup();
    render(<AuthMenu />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    await user.type(screen.getByLabelText('Email address'), 'penny@loves-to.dev');
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password12345');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(mockSubmit).toHaveBeenCalledWith('login', {
      emailAddress: 'penny@loves-to.dev',
      password: 'password12345',
      passwordConfirmation: '',
    });
  });

  it('shows the error message when submit rejects', async () => {
    mockSubmit.mockRejectedValue(new Error('Try another email address or password.'));
    const user = userEvent.setup();
    render(<AuthMenu />);

    await user.click(screen.getByRole('button', { name: 'Menu' }))
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    await user.type(screen.getByLabelText('Email address'), 'penny@loves-to.dev');
    await user.type(screen.getByLabelText('Password', { exact: true }), 'incorrect');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Try another email address or password.')).toBeInTheDocument();
  });

  it('submits signup wait all three fields, including the confirmation', async () => {
    mockSubmit.mockResolvedValue();
    const user = userEvent.setup();
    render(<AuthMenu />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    await user.click(screen.getByRole('button', { name: 'Need an account? Sign up' }));
  
    await user.type(screen.getByLabelText('Email address'), 'penny@loves-to.dev');
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password12345');
    await user.type(screen.getByLabelText('Confirm password', { exact: true }), 'password12345');

    await user.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(mockSubmit).toHaveBeenCalledWith('signup', {
      emailAddress: 'penny@loves-to.dev',
      password: 'password12345',
      passwordConfirmation: 'password12345',
    });
  });

  it('login button toggles between login and signup', async () => {
    const user = userEvent.setup();
    render(<AuthMenu />);

    await user.click(screen.getByRole('button', { name: 'Menu' }));
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    await user.click(screen.getByRole('button', { name: 'Need an account? Sign up' }));
    await user.click(screen.getByRole('button', { name: 'Already have an account? Log in' }));

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Confirm password')).not.toBeInTheDocument();
  });
});