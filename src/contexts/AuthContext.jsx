import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

const AuthContext = createContext({});
import PropTypes from "prop-types";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();

  // Fungsi untuk mendapatkan data user dari Firestore
  const getUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        // Jika dokumen tidak ada, buat dokumen baru dengan data default
        const defaultData = {
          role: "user",
          unit: "ULP Selong", // Default unit
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, "users", uid), defaultData);
        return defaultData;
      }
    } catch (error) {
      console.error("Error getting user data:", error);
      throw error;
    }
  };

  // Fungsi login
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData = await getUserData(userCredential.user.uid);

      const fullUserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        ...userData,
      };

      setUser(fullUserData);

      // Simpan ke localStorage untuk persistensi
      localStorage.setItem("user", JSON.stringify(fullUserData));

      return fullUserData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Fungsi logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Fungsi untuk mendapatkan path redirect berdasarkan role
  const getRedirectPath = (role) => {
    const roleRoutes = {
      inspektor: "/inspeksi",
      admin: "/admin/dashboard",
      diandra: "/diandra",
      har: "/pemeliharaan",
      yantek: "/pilih-petugas",
      user: "/dashboard",
    };
    return roleRoutes[role] || "/dashboard";
  };

  // Fungsi untuk mengecek apakah user memiliki akses ke data unit tertentu
  const hasUnitAccess = (targetUnit) => {
    if (!user) return false;

    // Admin bisa akses semua unit
    if (user.role === "admin") return true;

    // User lain hanya bisa akses unit mereka sendiri
    return user.unit === targetUnit;
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          const fullUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userData,
          };
          setUser(fullUserData);
          localStorage.setItem("user", JSON.stringify(fullUserData));
        } catch (error) {
          console.error("Error loading user data:", error);
          setError(error.message);
        }
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    getRedirectPath,
    hasUnitAccess,
  };
  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
