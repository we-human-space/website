yarn
echo "Starting M A A T server in $NODE_ENV";
case "$NODE_ENV" in
  "production")
    yarn run prod
    ;;
  "deployment")
    yarn run deploy
    ;;
  "development")
    yarn run dev:src
    ;;
  "test")
    yarn run dev:src
    ;;
  *)
    yarn run dev:src
    ;;
esac
