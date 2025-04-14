import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage sebagai default
import { combineReducers } from "redux";
import authReducer from "./authSlice";
import petugasReducer from "./petugasSlice";

// Konfigurasi persist untuk redux
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "petugas"], // hanya state ini yang akan di-persist
};

// Gabungkan semua reducer
const rootReducer = combineReducers({
  auth: authReducer,
  petugas: petugasReducer,
  // reducer lainnya bisa ditambahkan di sini
});

// Buat reducer yang persisten
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Buat store dengan reducer yang persisten
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Abaikan aksi dari redux-persist karena tidak serializable
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Buat persistor
export const persistor = persistStore(store);

export default store;
