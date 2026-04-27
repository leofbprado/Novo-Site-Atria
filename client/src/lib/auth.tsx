import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { identifyClarityUser } from "./track";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      // Sem auth disponível = visitante público anônimo
      identifyClarityUser(null);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // Marca como admin (logado) ou público (anônimo) pro Clarity filtrar
      identifyClarityUser(u ? { uid: u.uid, email: u.email } : null);
    });
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase Auth não configurado");
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
