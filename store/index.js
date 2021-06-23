import { useMemo } from 'react'
import { persistReducer } from 'redux-persist'
import storageSession from 'redux-persist/lib/storage/session'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import authentication from './reducers/authentication.reducer';
import cart from './reducers/cart.reducer';
import layout from './reducers/layout.reducer';
import positionReducer from './reducers/position.reducer';

export let store

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['cart', 'authentication']
}

const initialState = {
  root: {
    lastUpdate: 0,
    light: false,
    count: 0,
    settings: {},
    currentBranch: {},
    logo: '',
    start: false
  }
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_SETTINGS':
      return {
        ...state,
        settings: action.payload.settings
      }
    case 'SET_CURRENT_BRANCH':
      return {
        ...state,
        currentBranch: action.payload.branch
      }
    case 'SET_LOGO': {
      return {
        ...state,
        logo: action.payload.logo
      }
    }
    case "SET_START": {
      return {
        ...state,
        start: action.payload.start
      }
    }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  root: reducer,
  authentication,
  cart,
  layout,
  position: positionReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

function initStore(preloadedState = initialState) {
  return createStore(
    persistedReducer,
    preloadedState,
    composeWithDevTools(applyMiddleware())
  )
}

export const initializeStore = (preloadedState) => {
  let _store = store ?? initStore(preloadedState)

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState,
    })
    // Reset the current store
    store = undefined
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store
  // Create the store once in the client
  if (!store) store = _store

  return _store
}

export function useStore(initialState) {
  const store = useMemo(() => initializeStore(initialState), [initialState])
  return store
}
