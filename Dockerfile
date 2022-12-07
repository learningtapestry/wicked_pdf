FROM ruby:2.7.7

ENV APP_PATH /app/
ENV LANG C.UTF-8

WORKDIR $APP_PATH

# Add codebase
ADD . $APP_PATH

# Install gems
RUN gem install bundler \
    && bundle install \
    && rm -rf /usr/local/bundle/cache/*.gem \
    && find /usr/local/bundle/gems/ -name "*.c" -delete \
    && find /usr/local/bundle/gems/ -name "*.o" -delete
