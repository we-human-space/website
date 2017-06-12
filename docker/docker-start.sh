# Setting Environment
MAAT_ENV=$([ ! -z "$MAAT_ENV"  ] && echo "$MAAT_ENV" || echo "development");
NGINX_PORT=$([ "$MAAT_ENV" = "development" ] && echo "8888" || echo "80");

env MAAT_ENV="$MAAT_ENV" /bin/sh ../nginx/setup.sh

echo "Starting the docker images by building and recreating them"
env MAAT_ENV="$MAAT_ENV" NGINX_PORT="$NGINX_PORT" docker-compose down && \
env MAAT_ENV="$MAAT_ENV" NGINX_PORT="$NGINX_PORT" docker-compose build && \
env MAAT_ENV="$MAAT_ENV" NGINX_PORT="$NGINX_PORT" docker-compose up --force-recreate;
