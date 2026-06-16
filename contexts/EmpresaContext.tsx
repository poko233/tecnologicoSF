import { obtenerEmpresa } from '@/screens/admin/empresa/services/empresa.service';
import { Empresa } from '@/screens/admin/empresa/types/empresa.types';
import { obtenerMensajeError } from '@/screens/admin/empresa/types/httpError';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

interface EmpresaContextValue {
  empresa: Empresa | null;
  cargando: boolean;
  error: string | null;
  refrescar: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextValue | undefined>(undefined);

export function EmpresaProvider({ children }: { children: React.ReactNode }) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await obtenerEmpresa();
      setEmpresa(datos);
    } catch (err) {
      setError(
        obtenerMensajeError(err, 'Error al obtener configuración de empresa.'),
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <EmpresaContext.Provider value={{ empresa, cargando, error, refrescar: cargar }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa(): EmpresaContextValue {
  const ctx = useContext(EmpresaContext);
  if (!ctx) {
    throw new Error('useEmpresa debe usarse dentro de un EmpresaProvider');
  }
  return ctx;
}