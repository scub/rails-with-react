import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

import getMeta from 'utils/get_meta';

// No-ops (returns undefined) when the layout skipped the meta tag — see
// application.html.erb's OBSERVABILITY_ENABLED check. TracingInstrumentation
// adds W3C traceparent headers to same-origin fetch/xhr calls, which is what
// lets a browser trace continue as the same trace in the Rails/Tempo side —
// see observability/alloy.alloy for where it lands.
function setupFaro() {
  const url = getMeta('faro-collector-url');
  if (!url) return undefined;

  return initializeFaro({
    url,
    app: {
      service_name: 'rails-react-monolith-frontend',
      name: 'rails-react-monolith-frontend',
      version: '1.0.0',
    },
    instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
  });
}

export default setupFaro;
