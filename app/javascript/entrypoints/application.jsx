import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

// Bootstrap's CSS only — no bundle.js/Popper, since nothing here uses its
// interactive components yet. See the README if that changes.
import 'bootstrap/dist/css/bootstrap.min.css';
import 'styles/terminal_theme.css';
import 'styles/viking_theme.css';

import NotesBoard from 'components/notes_board';
import { hydrateBoardStore } from 'stores/global/board_store';
import { connectToCable } from 'stores/global/cable_store';
import { seedNotesStore } from 'stores/notes_store';
import setupFaro from 'utils/faro';
import initThemeSwitcher from 'utils/theme_switcher';

// Before anything else, so instrumentation covers the mount below too.
setupFaro();
initThemeSwitcher();

// This is the whole Rails -> React handoff. Read the #application-data blob
// exactly once, push it into stores, mount, and never look at the DOM's
// server-rendered state again.
const dataNode = document.getElementById('application-data');
const rootProps = JSON.parse(dataNode.getAttribute('data'));

hydrateBoardStore(rootProps);
seedNotesStore(rootProps.notes);
connectToCable(rootProps.realtime_token);

const root = ReactDOM.createRoot(document.getElementById('application-root'));
root.render(
  <StrictMode>
    <NotesBoard />
  </StrictMode>
);
