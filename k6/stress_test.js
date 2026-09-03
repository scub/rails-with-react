import boardFlow from './lib/board_flow.js';

// Stress test: move beyond normal load (load_test.js's 5 VUs) to catch
// degradation under sustained pressure
export const options = {
  scenarios: {
    board_traffic: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '30s', target: 20 },
        { duration: '30s', target: 30 },
        { duration: '1m', target: 30 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    'http_req_duration{name:BoardShow}': ['p(95)<2000'],
    'http_req_duration{name:NotesIndex}': ['p(95)<2000'],
    'http_req_duration{name:NotesCreate}': ['p(95)<2000'],
  },
};

export default boardFlow;
