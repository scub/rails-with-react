import getMeta from 'utils/get_meta';

// Trimmed-down version of the real app's fetcher() (app/javascript/utils/fetch.js).
// The one convention that matters for this toy: `internal: true` attaches the
// CSRF token so Rails' forgery protection accepts the request.
async function fetcher(url, { method = 'GET', internal = false, data = {} } = {}) {
  const body = internal ? { ...data, authenticity_token: getMeta('csrf-token') } : data;

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'same-origin',
    body: method === 'GET' ? undefined : JSON.stringify(body),
  });

  if (!response.ok) throw response;
  return response.json();
}

const fetchPost = (url, options = {}) => fetcher(url, { ...options, method: 'POST' });

export { fetcher, fetchPost };
