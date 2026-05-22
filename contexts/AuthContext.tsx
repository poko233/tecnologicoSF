// contexts/AuthContext.tsx
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
import { useModulesStore } from "../store/modulesStore";

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
  allowedRoutes: Set<string>; // ← añadido
  login: (token: string) => Promise<Usuario>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState<Set<string>>(new Set());
  const { fetchModulos, clearModulos } = useModulesStore();

  const hasRole = useCallback(
    (role: string) => (user ? user.roles.includes(role) : false),
    [user],
  );

  const hasAnyRole = useCallback(
    (roles: string[]) =>
      user ? roles.some((r) => user.roles.includes(r)) : false,
    [user],
  );

  // Efecto inicial: obtener usuario → obtener módulos
  useEffect(() => {
    (async () => {
      try {
        const userData = await httpClient.getAuth<Usuario>("/api/user");
        setUser(userData);

        // Cargar módulos inmediatamente
        await fetchModulos();
        setAllowedRoutes(useModulesStore.getState().allowedRoutes);
      } catch {
        await clearSession();
        clearModulos();
        setUser(null);
        setAllowedRoutes(new Set());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (token: string): Promise<Usuario> => {
    await saveToken(token);
    const userData = await httpClient.getAuth<Usuario>("/api/user");
    setUser(userData);

    await fetchModulos();
    setAllowedRoutes(useModulesStore.getState().allowedRoutes);

    return userData;
  };

  const logout = async () => {
    try {
      await httpClient.postAuth("/api/logout", {});
    } catch {}
    await clearSession();
    clearModulos();
    setUser(null);
    setAllowedRoutes(new Set());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.roles?.includes("Administrador") ?? false,
        allowedRoutes,
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
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
}
