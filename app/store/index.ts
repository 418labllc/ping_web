import { combineReducers, configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import authSlice from './reducers/authSlice';


const rootReducer = combineReducers({
  auth: authSlice,
});

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(logger),
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
