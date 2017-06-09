import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import reducer from '../reducers/index';

export default function configure_store(preloadedState) {
  if(__PROD__) {
    return createStore(
      reducer,
      preloadedState,
      applyMiddleware(
        thunkMiddleware
      )
    );
  }else{
    const loggerMiddleware = createLogger();
    return createStore(
      reducer,
      preloadedState,
      applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
      )
    );
  }
};
