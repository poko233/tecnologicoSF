// screens/convalidacion/context/ConvalidacionContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface ConvalidacionState {
  pasoActual: number; // 1 a 5
  solicitudId: number | null;
  codigoSolicitud: string;
  idCarreraDestino: number | null;
  idUsuario: number | null;
  gestionLabel: string;
}

interface ConvalidacionContextType extends ConvalidacionState {
  setPasoActual: (paso: number) => void;
  setSolicitudId: (id: number) => void;
  setCodigoSolicitud: (codigo: string) => void;
  setIdCarreraDestino: (id: number) => void;
  setIdUsuario: (id: number) => void;
  setGestionLabel: (label: string) => void;
  avanzarPaso: () => void;
  retrocederPaso: () => void;
  resetWizard: () => void;
}

const ConvalidacionContext = createContext<ConvalidacionContextType | null>(
  null
);

const initialState: ConvalidacionState = {
  pasoActual: 1,
  solicitudId: null,
  codigoSolicitud: '',
  idCarreraDestino: null,
  idUsuario: null,
  gestionLabel: '',
};

export function ConvalidacionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConvalidacionState>(initialState);

  const setPasoActual = (paso: number) => {
    setState((prev) => ({ ...prev, pasoActual: paso }));
  };

  const setSolicitudId = (id: number) => {
    setState((prev) => ({ ...prev, solicitudId: id }));
  };

  const setCodigoSolicitud = (codigo: string) => {
    setState((prev) => ({ ...prev, codigoSolicitud: codigo }));
  };

  const setIdCarreraDestino = (id: number) => {
    setState((prev) => ({ ...prev, idCarreraDestino: id }));
  };

  const setIdUsuario = (id: number) => {
    setState((prev) => ({ ...prev, idUsuario: id }));
  };

  const setGestionLabel = (label: string) => {
    setState((prev) => ({ ...prev, gestionLabel: label }));
  };

  const avanzarPaso = () => {
    setState((prev) => ({
      ...prev,
      pasoActual: Math.min(prev.pasoActual + 1, 5),
    }));
  };

  const retrocederPaso = () => {
    setState((prev) => ({
      ...prev,
      pasoActual: Math.max(prev.pasoActual - 1, 1),
    }));
  };

  const resetWizard = () => {
    setState(initialState);
  };

  return (
    <ConvalidacionContext.Provider
      value={{
        ...state,
        setPasoActual,
        setSolicitudId,
        setCodigoSolicitud,
        setIdCarreraDestino,
        setIdUsuario,
        setGestionLabel,
        avanzarPaso,
        retrocederPaso,
        resetWizard,
      }}
    >
      {children}
    </ConvalidacionContext.Provider>
  );
}

export function useConvalidacionContext() {
  const context = useContext(ConvalidacionContext);
  if (!context) {
    throw new Error(
      'useConvalidacionContext debe usarse dentro de ConvalidacionProvider'
    );
  }
  return context;
}
