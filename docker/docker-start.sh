# Setting Environment
CURR_DIR=$(pwd);
MAAT_ENV=$([ ! -z "$MAAT_ENV"  ] && echo "$MAAT_ENV" || echo "development");

echo "Creating the site-enabled folder";
if [ ! -d "../nginx/$MAAT_ENV/sites-enabled" ]; then
  mkdir -p "../nginx/$MAAT_ENV/sites-enabled";
fi

echo "Setting NGINX site-enabled symbolic links";
cd "../nginx/$MAAT_ENV/sites-available/";
for f in *.conf ; do
  if ! [ -L "../sites-enabled/$f" ] ; then
    ln -s "$(pwd)/$f" "../sites-enabled/$f";
  fi;
done ;
cd "$CURR_DIR";


echo "Starting the docker images by building and recreating them"
env MAAT_ENV="$MAAT_ENV" docker-compose down && \
env MAAT_ENV="$MAAT_ENV" docker-compose build && \
env MAAT_ENV="$MAAT_ENV" docker-compose up --force-recreate;
