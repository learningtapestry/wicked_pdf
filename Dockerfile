FROM ruby:2.7.7

ENV APP_PATH=/app/
ENV LANG=C.UTF-8

WORKDIR $APP_PATH

# Add codebase
ADD . $APP_PATH

# Install gems
ENV BUNDLER_VERSION=2.4.22
RUN gem update --system 3.4.9 \
    && gem install bundler:"$BUNDLER_VERSION" \
    && bundle install --jobs `expr $(cat /proc/cpuinfo | grep -c "cpu cores") - 1` --retry 3 \
    && rm -rf /usr/local/bundle/cache/*.gem \
    && find /usr/local/bundle/gems/ -name "*.c" -delete \
    && find /usr/local/bundle/gems/ -name "*.o" -delete
