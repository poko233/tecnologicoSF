// screens/arqueo/hooks/useArqueo.ts
import { useEffect, useRef } from "react";
import { useArqueoStore } from "../store/arqueoStore";

export const useArqueo = () => {
  const {
    activeArqueo,
    loading,
    error,
    fetchActiveArqueo,
    openArqueo,
    closeArqueo,
    clear,
  } = useArqueoStore();

  const hasMounted = useRef(false);

  // 🔥 Solo se ejecuta una vez, incluso si el componente se desmonta y vuelve a montar
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      fetchActiveArqueo();
    }
  }, []);

  return {
    activeArqueo,
    loading,
    error,
    openArqueo,
    closeArqueo,
    clear,
    refetch: fetchActiveArqueo, // Si alguien quiere forzar una recarga manual
  };
};
