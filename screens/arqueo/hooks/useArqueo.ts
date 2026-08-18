import { useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useArqueoStore } from "../store/arqueoStore";

export const useArqueo = () => {
  const { user } = useAuth();
  const {
    activeArqueo,
    loading,
    error,
    forceFetchActiveArqueo,
    openArqueo,
    closeArqueo,
    clear,
  } = useArqueoStore();

  useEffect(() => {
    if (user) {
      forceFetchActiveArqueo();
    } else {
      clear();
    }
  }, [user]);

  return {
    activeArqueo,
    loading,
    error,
    openArqueo,
    closeArqueo,
    clear,
    refetch: forceFetchActiveArqueo,
  };
};
