# Setting Environment
: ${MAAT_ENV:?"development"};

# Making the site-enabled folder
if [ ! -d "../nginx/$MAAT_ENV/site-enabled" ]; then
  mkdir -p "../nginx/$MAAT_ENV/site-enabled";
fi

# Setting NGINX site-enabled symbolic links
for f in "../nginx/$MAAT_ENV/site-available/*.conf" ; do
  ln "../nginx/$MAAT_ENV/site-available/$f" "../nginx/$MAAT_ENV/site-enabled/$f" ;
done ;

# Start the images by building and recreating them
docker-compose down &&
docker-compose build &&
docker-compose up --force-recreate;
