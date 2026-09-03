import boardFlow from './lib/board_flow.js';

// Breakpoint test: ramp up VUs until breaching thresholds
export const options = {
  scenarios: {
    board_traffic: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '2m', target: 150 },
        { duration: '2m', target: 200 },
      ],
    },
  },
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.05', abortOnFail: true }],
    'http_req_duration{name:BoardShow}': [{ threshold: 'p(95)<3000', abortOnFail: true }],
  },
};

export default boardFlow;
