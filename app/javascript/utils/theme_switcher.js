const STORAGE_KEY = 'theme';
const DEFAULT_THEME = 'terminal';
const NEXT_THEME = { terminal: 'viking', viking: 'terminal' };

function applyTheme(button, theme) {
  document.documentElement.dataset.theme = theme;
  button.setAttribute('aria-pressed', String(theme === 'viking'));
  button.title = `Switch to ${NEXT_THEME[theme]} theme`;
}

export default function initThemeSwitcher() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  applyTheme(button, document.documentElement.dataset.theme || DEFAULT_THEME);

  button.addEventListener('click', () => {
    const theme = NEXT_THEME[document.documentElement.dataset.theme] || DEFAULT_THEME;
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(button, theme);
  });
}
