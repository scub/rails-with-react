import boardFlow from './lib/board_flow.js';

// Soak test: moderate, steady load held for a long duration/
// Defaults to 2h. Override for a shorter dry run.:
//   k6 run -e SOAK_DURATION=5m k6/soak_test.js
const DURATION = __ENV.SOAK_DURATION || '2h';
const VUS = Number(__ENV.SOAK_VUS) || 5;

export const options = {
  scenarios: {
    board_traffic: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
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
