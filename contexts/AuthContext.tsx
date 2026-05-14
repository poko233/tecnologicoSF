import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { httpClient } from "../http/httpClient";
import { clearSession, saveToken } from "../storage/secureStorage";

export type Usuario = {
  nombreUsuario: string;
  nombres: string;
  apellido: string;
  correo: string;
  roles: string[];
  telefono: string;
  foto: string | null;
};

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  isAdmin: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const hasRole = useCallback(
    (role: string) => {
      if (!user) return false;
      return user.roles.includes(role);
    },
    [user],
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => {
      if (!user) return false;
      return roles.some((r) => user.roles.includes(r));
    },
    [user],
  );

  // Intenta cargar el perfil desde el servidor si existe sesión previa
  useEffect(() => {
    (async () => {
      try {
        const userData = await httpClient.getAuth<Usuario>("/api/user");
        setUser(userData);
      } catch {
        await clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (token: string) => {
    await saveToken(token);
    const userData = await httpClient.getAuth<Usuario>("/api/user");
    setUser(userData);
  };

  const logout = async () => {
    try {
      await httpClient.postAuth("/api/logout", {});
    } catch (e) {
      // ignorar errores de red
    }
    await clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.roles?.includes("Administrador") ?? false,
        login,
        logout,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
