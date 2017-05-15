# Setting Environment
MAAT_ENV=$([ ! -z "$MAAT_ENV"  ] && echo "$MAAT_ENV" || echo "development");

env MAAT_ENV="$MAAT_ENV" /bin/sh ../nginx/setup.sh

echo "Starting the docker images by building and recreating them"
env MAAT_ENV="$MAAT_ENV" docker-compose down && \
env MAAT_ENV="$MAAT_ENV" docker-compose build && \
env MAAT_ENV="$MAAT_ENV" docker-compose up --force-recreate;
