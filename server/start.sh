yarn
echo "Starting M A A T server in $NODE_ENV";
case "$NODE_ENV" in
  "production")
    yarn run deploy:no-test
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
