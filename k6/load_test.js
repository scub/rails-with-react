import boardFlow from './lib/board_flow.js';

// Rails' code reloader serializes requests behind a global lock regardless of
// Puma's thread count. Demonstrative only
export const options = {
  scenarios: {
    board_traffic: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '20s', target: 5 },
        { duration: '10s', target: 0 },
      ],
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
