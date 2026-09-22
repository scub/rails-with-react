import { useState } from 'react';
import { useSnapshot } from 'valtio';
import * as Dialog from '@radix-ui/react-dialog';

import { boardStore } from 'stores/global/board_store';
import { useAuth } from 'hooks/use_auth';

function AuthMenu() {
  const { authenticated } = useSnapshot(boardStore);
  const { submit, logout, pending } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(null);

  function openModal(nextMode) {
    setMode(nextMode);
    setError(null);
    setModalOpen(true);
    setMenuOpen(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    try {
      await submit(mode, { emailAddress, password, passwordConfirmation });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="position-relative">
      <button type="button" className="icon-btn btn btn-outline-light btn-sm" onClick={() => setMenuOpen((open) => !open)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {menuOpen && (
        <div className="dropdown-menu show position-absolute end-0 mt-1">
          {authenticated ? (
            <button type="button" className="dropdown-item" onClick={logout}>Log out</button>
          ) : (
            <button type="button" className="dropdown-item" onClick={() => openModal('login')}>Log in</button>
          )}
        </div>
      )}

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-backdrop show" />
          <Dialog.Content className="modal d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <Dialog.Title className="modal-title">{mode === 'login' ? 'Log in' : 'Sign up'}</Dialog.Title>
                  <Dialog.Description className="visually-hidden">
                    {mode === 'login' ? 'Login to your account' : 'Create a new account'}
                  </Dialog.Description>
                  <Dialog.Close asChild>
                    <button type="button" className="btn-close btn-close-white" aria-label="Close" />
                  </Dialog.Close>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    {error && <p className="text-danger">{error}</p>}
                    <div className="mb-3">
                      <label className="form-label" htmlFor="auth-email">Email address</label>
                      <input id="auth-email" type="email" className="form-control" value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="auth-password">Password</label>
                      <input id="auth-password" type="password" className="form-control" value={password}
                        onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {mode === 'signup' && (
                      <div className="mb-3">
                        <label className="form-label" htmlFor="auth-password-confirmation">Confirm password</label>
                        <input id="auth-password-confirmation" type="password" className="form-control" value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)} required />
                      </div>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={pending}>
                      {mode === 'login' ? 'Log in' : 'Sign up'}
                    </button>
                  </form>
                  <button type="button" className="btn btn-link"
                    onClick={() => openModal(mode === 'login' ? 'signup' : 'login')}>
                      {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default AuthMenu;