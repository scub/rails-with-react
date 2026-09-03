import boardFlow from './lib/board_flow.js';

// Smoke test: Check functionality end to end with trivial load
export const options = {
  scenarios: {
    board_traffic: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:BoardShow}': ['p(95)<1000'],
    'http_req_duration{name:NotesIndex}': ['p(95)<1000'],
    'http_req_duration{name:NotesCreate}': ['p(95)<1000'],
  },
};

export default boardFlow;
