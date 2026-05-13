import React, { createContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCzuqpy3Md1klstWUe8X0yXFxpfB6pVaS4",
  authDomain: "movie-recommender-58b62.firebaseapp.com",
  projectId: "movie-recommender-58b62",
  storageBucket: "movie-recommender-58b62.firebasestorage.app",
  messagingSenderId: "1063899694223",
  appId: "1:1063899694223:web:63848c20b3792300d01cfa",
  measurementId: "G-X5WJ64RQ0D2300d01cfa",
  measurementId: "G-X5WJ64RQ0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, auth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
