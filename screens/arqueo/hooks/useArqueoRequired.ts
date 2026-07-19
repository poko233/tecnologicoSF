// hooks/useArqueoRequired.ts
import { useState } from "react";
import { useArqueoStore } from "../store/arqueoStore";

export const useArqueoRequired = () => {
  const { activeArqueo, openArqueo } = useArqueoStore();
  const [modalVisible, setModalVisible] = useState(false);

  const ensureArqueo = async (): Promise<boolean> => {
    if (activeArqueo) return true;

    // Mostramos el modal de apertura (usaremos ArqueoOpenModal dentro del componente)
    return new Promise((resolve) => {
      setModalVisible(true);
      // El modal, al abrir exitosamente, llamará a resolve(true)
      // Si cancela, resolve(false)
    });
  };

  return {
    ensureArqueo,
    modalVisible,
    setModalVisible,
    activeArqueo,
    openArqueo,
  };
};
