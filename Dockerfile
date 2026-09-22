FROM ruby:3.4-slim

RUN apt-get update -qq \
    && apt-get install -y --no-install-recommends \
       build-essential libjemalloc-dev libpq-dev libyaml-dev curl git ca-certificates gnupg postgresql-client \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

# Service user
ARG SVCUSER=svc
RUN groupadd -r $SVCUSER \
    && useradd --shell /bin/nologin --gid $SVCUSER --home-dir /app --system --no-create-home $SVCUSER \
    && mkdir -p /app \
    && chown -R $SVCUSER:$SVCUSER /app

USER $SVCUSER
WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle config set --local frozen true \
    && bundle install

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD curl -f http://localhost:3000/up || exit 1

ENTRYPOINT [ "bin/docker-entrypoint" ]
CMD ["bin/rails", "server", "-b", "0.0.0.0"]
