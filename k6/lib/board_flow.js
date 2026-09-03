import http from 'k6/http';
import { check, sleep } from 'k6';

// Common harness shared by every k6/*_test.js scenario
// Scrapes csrf token, GET/POST notes on board
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

function extract(pattern, body) {
  const match = body.match(pattern);
  return match ? match[1] : null;
}

export default function boardFlow() {
  const home = http.get(`${BASE_URL}/`, { tags: { name: 'BoardShow' } });
  const ok = check(home, { 'board loads': (r) => r.status === 200 });
  if (!ok) {
    sleep(1);
    return;
  }

  const csrfToken = extract(/name="csrf-token" content="([^"]+)"/, home.body);
  // The board id sits inside the #application-data div's `data` attribute,
  // which is HTML-entity-escaped (`&quot;board_id&quot;:1`), not literal quotes.
  const boardId = extract(/&quot;board_id&quot;:(\d+)/, home.body);

  const notesIndex = http.get(`${BASE_URL}/api/v1/boards/${boardId}/notes`, {
    tags: { name: 'NotesIndex' },
  });
  check(notesIndex, { 'notes index 200': (r) => r.status === 200 });

  const payload = JSON.stringify({ note: { content: `k6 note ${__VU}-${__ITER}` } });
  const create = http.post(`${BASE_URL}/api/v1/boards/${boardId}/notes`, payload, {
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
    tags: { name: 'NotesCreate' },
  });
  check(create, { 'note created': (r) => r.status === 201 });

  sleep(1);
}
