CURR_DIR=$(pwd);

if [ ! -d "../nginx/$MAAT_ENV/sites-enabled" ]; then
  echo "Creating the site-enabled folder";
  mkdir -p "../nginx/$MAAT_ENV/sites-enabled";
else
  echo "Cleaning the site-enabled folder";
  rm -rf "../nginx/$MAAT_ENV/sites-enabled/*";
fi

echo "Setting NGINX site-enabled symbolic links";
cd "../nginx/$MAAT_ENV/sites-available/";
for f in *.conf ; do
  # Removed symlinks in favor of copy/remove due to docker's incompatibility with symlinks
  if [ -f "../sites-enabled/$f" ] ; then
    rm "../sites-enabled/$f";
  fi;
  cp "$(pwd)/$f" "../sites-enabled/$f";
done ;
cd "$CURR_DIR";
