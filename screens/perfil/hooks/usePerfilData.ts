import { useAuth } from "../../../contexts/AuthContext";

export function usePerfilData() {
  const { user } = useAuth();
  return {
    nombre: user?.nombres + " " + user?.apellido || "Usuario",
    nombreUsuario: user?.nombreUsuario || "",
    correo: user?.correo || "",
    telefono: user?.telefono || "",
    direccion: user?.direccion || "",
    roles: user?.roles || [],
    foto: user?.foto || null,
    codigoQr: user?.codigoQr || null,
  };
}
