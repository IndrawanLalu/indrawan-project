import { createSlice } from '@reduxjs/toolkit';

// Fungsi untuk menyimpan state ke localStorage
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('user', serializedState);
  } catch (error) {
    console.error("Could not save state", error);
  }
};

// Fungsi untuk mengambil state dari localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('user');
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Could not load state", error);
    return null;
  }
};

// Ambil user dari localStorage saat inisialisasi
const initialState = {
  user: loadStateFromLocalStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.user = {
        uid: action.payload.uid,
        email: action.payload.email,
        role: action.payload.role,
        // tambahkan data lain yang diperlukan
      };
      saveStateToLocalStorage(state.user); // Simpan user ke localStorage
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('user'); // Hapus user dari localStorage saat logout
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
