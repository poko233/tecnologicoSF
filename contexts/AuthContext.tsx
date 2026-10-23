// contexts/AuthContext.tsx
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import { BASE_URL, httpClient } from "../http/httpClient";
import { useArqueoStore } from "../screens/arqueo/store/arqueoStore";
import { clearSession, getToken, saveToken } from "../storage/secureStorage";
import { useModulesStore } from "../store/modulesStore";
import { getTabsForRoles } from "../utils/roleBasedTabs";

interface BackendUser {
  id: number;
  usuario: string;
  ci: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: string;
  fecha_nac: string;
  email: string | null;
  telefono: string | null;
  celular: string;
  direccion: string;
  matricula: string;
  expedido: string;
  codigo_qr: string | null;
  verificacion: string;
  foto: string | null;
  estado: string;
  created_at: string;
  updated_at: string;
  roles: string[];
}

export type Usuario = {
  nombreUsuario: string;
  nombres: string;
  apellido: string;
  correo: string;
  roles: string[];
  telefono: string;
  foto: string | null;
  direccion?: string;
  codigoQr?: string | null;
};

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  isAdmin: boolean;
  allowedRoutes: Set<string>;
  login: (token: string) => Promise<Usuario>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Función que mapea la respuesta del backend a nuestro tipo Usuario
function mapBackendUserToUsuario(data: any): Usuario {
  return {
    nombreUsuario: data.usuario || "",
    nombres: data.nombres || "",
    apellido:
      `${data.apellidoPaterno || ""} ${data.apellidoMaterno || ""}`.trim(),
    correo: data.email || "",
    telefono: data.celular || data.telefono || "",
    roles: data.roles || [],
    foto: data.foto ? `${BASE_URL}/${data.foto}` : null,
    direccion: data.direccion || "",
    codigoQr: data.codigo_qr || null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState<Set<string>>(new Set());
  const { fetchModulos, clearModulos } = useModulesStore();

  const buildAllowedRoutes = useCallback((roles: string[]) => {
    const moduleRoutes = useModulesStore.getState().allowedRoutes;
    const tabs = getTabsForRoles(roles);
    return new Set<string>([
      ...moduleRoutes,
      ...tabs.map((tab) => `/${tab.name}`),
    ]);
  }, []);

  const hasRole = useCallback(
    (role: string) => (user ? user.roles.includes(role) : false),
    [user],
  );

  const hasAnyRole = useCallback(
    (roles: string[]) =>
      user ? roles.some((r) => user.roles.includes(r)) : false,
    [user],
  );

  // Restaurar sesión únicamente si hay un token recuperable.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (active) {
            clearModulos();
            setUser(null);
            setAllowedRoutes(new Set());
          }
          return;
        }
        const rawData = await httpClient.getAuth<any>("/api/user");
        const userData = mapBackendUserToUsuario(rawData);
        await fetchModulos();
        if (active) {
          setAllowedRoutes(buildAllowedRoutes(userData.roles));
          setUser(userData);
        }
      } catch (err: any) {
        // Un 401/403 al validar identidad invalida la sesión.
        // Un fallo al cargar permisos tampoco permite navegar con permisos vacíos.
        await clearSession();
        if (active) {
          clearModulos();
          setUser(null);
          setAllowedRoutes(new Set());
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [buildAllowedRoutes, clearModulos, fetchModulos]);

  const login = async (token: string): Promise<Usuario> => {
    await saveToken(token);
    try {
      const rawData = await httpClient.getAuth<any>("/api/user");
      const userData = mapBackendUserToUsuario(rawData);
      await fetchModulos();
      setAllowedRoutes(buildAllowedRoutes(userData.roles));
      setUser(userData);
      Toast.show({
        type: "success",
        text1: "Inicio de sesión exitoso",
        text2: "Bienvenido de nuevo.",
      });
      return userData;
    } catch (err) {
      await clearSession();
      clearModulos();
      setUser(null);
      setAllowedRoutes(new Set());
      throw err;
    }
  };

  const logout = async () => {
    try {
      await httpClient.postAuth("/api/logout", {});
    } catch {}
    await clearSession();
    clearModulos();
    useArqueoStore.getState().clear();
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
