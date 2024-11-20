import { configureStore } from "@reduxjs/toolkit";
import { sessionApi } from "./apis/session";

export const store = configureStore({
  reducer: {
    [sessionApi.reducerPath]: sessionApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    const middleWares = [sessionApi.middleware];
    return getDefaultMiddleware().concat(middleWares);
  },
});
