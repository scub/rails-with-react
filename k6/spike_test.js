import boardFlow from './lib/board_flow.js';

// Spike test: sudden surge to well past normal load, then a sudden drop
export const options = {
  scenarios: {
    board_traffic: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },
        { duration: '10s', target: 5 },
        { duration: '10s', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 5 },
        { duration: '20s', target: 5 },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export default boardFlow;
