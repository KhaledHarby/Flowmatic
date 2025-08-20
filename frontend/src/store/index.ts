import { configureStore } from '@reduxjs/toolkit';
import workflowReducer from './slices/workflowSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    workflow: workflowReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
