CURR_DIR=$(pwd);

echo "Creating the site-enabled folder";
if [ ! -d "../nginx/$MAAT_ENV/sites-enabled" ]; then
  mkdir -p "../nginx/$MAAT_ENV/sites-enabled";
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
