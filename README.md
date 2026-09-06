# SPA using Rails with React 

A single-page application using Rails and React with ActionCable to sync changes between multiple sessions, and Sidekiq for processing jobs asynchronously.

This demo includes both an observability and testing suite built with Grafana OSS and native tooling. Provides linting, security scanning, including unit, end-to-end, and load testing.

## Running the app

Run the following and open http://localhost:3000

```bash
docker compose up --build
```

## Running the testing suite

The testing suite includes unit tests with [rspec](https://rspec.info/) and [vitest](https://vitest.dev/), end-to-end testing through [playwright](https://playwright.dev/), and load testing with [k6](https://grafana.com/docs/k6/latest/)

### Running the unit tests

```bash
docker compose exec -e RAILS_ENV=test web bash -c "bin/rails db:prepare && bundle exec rspec"
docker compose exec web npm test
```

### Running the end-to-end or load tests

```bash
docker compose --profile e2e run --rm e2e # end-to-end
docker compose --profile load run --rm k6 # load tests
```

#### Notes regarding the Load tests (k6)

**Interpret any local results considering:** `web` runs `RAILS_ENV=development` when invoked locally.
Rails' autoloader/reloader will wrap every request with a lock to enable code reloads between requests.
This causes requests to be serialized regardless of Puma's thread count (`config/puma.rb`'s
`RAILS_MAX_THREADS`, default `5`).

The local harness is for verifying the load-testing tooling itself, and will not provide an appropriate
gauge of the app's real capacity.

To test under "real conditions: run `web` with `RAILS_ENV=production` (needs `RAILS_MASTER_KEY` or `SECRET_KEY_BASE`, 
and `rails assets:precompile`). Set `RAILS_MAX_THREADS`/`WEB_CONCURRENCY` appropriately and verify the reloader lock isn't
your bottleneck before trusting any results.

## Observability suite (Grafana)

The setup provided by `docker-compose` has an accompanying observability suite that provides:

- [Grafana](https://grafana.com/oss/): Visualization and dashboarding
- [Alloy](https://grafana.com/docs/alloy/latest/): Scrape container logs, acting Faro receiver
- [Faro](https://grafana.com/oss/faro/): Frontend telemetry / real user monitoring (RUM)
- [Loki](https://grafana.com/docs/loki/latest/): Log aggregation
- [Prometheus](https://prometheus.io/docs/introduction/overview/): TSDB and scraper for metrics  
- [Pyroscope](https://grafana.com/oss/pyroscope/): Continuous profiling (Flame graphs)
- [Tempo](https://grafana.com/oss/tempo/): Distributed tracing

> [!NOTE]
> This setup is only demonstrative, and not considered production-ready. `GF_AUTH_ANONYMOUS_ENABLED`/`GF_AUTH_DISABLE_LOGIN_FORM` provide admin access to Grafana without a login, there is no S3-compatible storage layer (Minio/SeaweedFS), or Prometheus extensions (Mimir/Thanos).

### Before starting the observability suite

Before starting the observability suite, ensure `OBSERVABILITY_ENABLED` is set to `"true"` in docker-compose.yml's `x-defaults`,
and restart the docker containers. All application-level instrumentation is gated behind this flag.

### Running the observability suite

Start the `observability` profile, you can access Grafana on http://localhost:3001

```bash
docker compose --profile observability up -d
```

### Whats provided in the observabilty suite?

**Dashboards:**: provisioned automatically from `observability/grafana-provisioning/dashboards/`

- `Rails/React Monolith Overview`) This one pane covers four signals:
  - **Health**: service up/down (from Prometheus's own scrape health, `up{job=...}`), request rate,
    exception rate, p95 latency, and a requests-by-route-and-status graph.
  - **Business metrics**: Visualizes the custom metrics from `notes_metrics.rb`, live: create a note in
    the app in one tab and watch `Notes Created (total)` and `Board Notes Count` move in another.
  - **Traces**: a table of recent traces (Tempo) click a Trace ID to open it in Explore.
  - **Profiles**: the live CPU flame graph (Pyroscope), aggregated over the dashboard's time range.

- `Faro Frontend Monitoring`) This dashboard includes Web Vitals, exceptions, browsers/sessions
  - **Performance**: Visualize the Frontend KPIs (TTFB/FCP/LCP/CLS/INP) per-page.
  - **Exceptions**: exceptions breakdown, top pages and browsers exhibiting issues 
  - **Meta**: Generic stats, visits total and by browser
  - **Events**: Shows top events broken down by sessions

### How is the instrumentation setup?

- **Tracing**: `config/initializers/observability.rb` turns on all available `opentelemetry-instrumentation-*` gems 
  (`c.use_all`: Rack, Action Pack, Action View, Active Record, Net::HTTP, ...) and is responsible for exporting spans
  to `tempo` over OTLP. Somewhat naive, but illustrative.
- **Profiling**: `config/initializers/observability.rb` configures the `pyroscope` gem, enables profiling with rbspy 
  and pushes CPU profiles to `pyroscope` every ~10s. `pyroscope-otel`'s span processor also tags each trace's root span with
  `pyroscope.profile.id` to allow Tempo to link spans to their profile.
- **Metrics**: `config/initializers/prometheus_metrics.rb` and `config/sidekiq_metrics.ru` uses `prometheus-client` and
  `sidekiq-prometheus-exporter` to serve custom metrics on `GET /metrics`.
- **Logging**: Logs are scraped from the docker socket by `Alloy` and forwarded to `Loki`. In a real environment, these logs
  would be pulled from the Kubernetes API, scraped directly off of the filesystem, or forwarded using a Cloud primitive like Firehose.
- **Real User/Browser Monitoring**: `app/javascript/utils/faro.js` initializes the [`@grafana/faro-web-sdk`](https://github.com/grafana/faro-web-sdk)
  at the top of `application.jsx`. It captures errors, console, web-vitals, and session tracking and fowards them to Alloy.

## Troubleshooting

### Issues adding gems or packages

When running this in Docker you will find the `bundle-data`/`node-modules-data` (and `e2e-node-modules-data`) volumes
get mounted over `/usr/local/bundle`/`/app/node_modules` in every service that uses them. 

This reduces the cycle time for `docker compose up`, but **rebuilding the image after adding a dependency is not sufficient**.

Symptoms: 
  - Ruby: `Bundler::GemNotFound` (`Could not find <gem> in locally installed gems`) or `bundler: command not found: <binary>` for Ruby
  - React/Vite: Console errors in browser on the new import for JS, right after a rebuild that appeared to succeed.

To address this run the install against the volume directly before the next `up`:

```bash
docker compose run --rm web bundle install
docker compose run --rm web yarn install --registry https://registry.npmjs.org
```

## Running scans

Scanning and attestation occurs in multiple layers

- Ruby: [bundle audit](https://github.com/rubysec/bundler-audit) and [brakeman](https://brakemanscanner.org/)
- Node: [npm audit](https://docs.npmjs.com/cli/v12/commands/npm-audit)
- Docker (SBOM/CVEs): ["docker scout"](https://docs.docker.com/scout/)
