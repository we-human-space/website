import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import reducer from './reducers';

export default function configure_store(preloadedState) {
  if(__DEV__ || __TEST__) {
    const loggerMiddleware = createLogger();
    return createStore(
      reducer,
      preloadedState,
      applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
      )
    );
  }else{
    return createStore(
      reducer,
      preloadedState,
      applyMiddleware(
        thunkMiddleware
      )
    );
  }
};
