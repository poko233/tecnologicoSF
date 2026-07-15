// screens/convalidacion/context/ConvalidacionContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';
import type { Paso1FormData } from '../types';

interface ConvalidacionState {
  pasoActual: number; // 1 a 5
  solicitudId: number | null;
  codigoSolicitud: string;
  idCarreraDestino: number | null;
  idUsuario: number | null;
  gestionLabel: string;
  paso1Data: Paso1FormData | null;
}

interface ConvalidacionContextType extends ConvalidacionState {
  setPasoActual: (paso: number) => void;
  setSolicitudId: (id: number) => void;
  setCodigoSolicitud: (codigo: string) => void;
  setIdCarreraDestino: (id: number | null) => void;
  setIdUsuario: (id: number | null) => void;
  setGestionLabel: (label: string) => void;
  setPaso1Data: (data: Paso1FormData) => void; 
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
  paso1Data: null,
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

  const setIdCarreraDestino = (id: number | null) => {
    setState((prev) => ({ ...prev, idCarreraDestino: id }));
  };
  const setIdUsuario = (id: number | null) => {
    setState((prev) => ({ ...prev, idUsuario: id }));
  };

  const setGestionLabel = (label: string) => {
    setState((prev) => ({ ...prev, gestionLabel: label }));
  };

  const setPaso1Data = (data: Paso1FormData) => {
    setState((prev) => ({ ...prev, paso1Data: data })); // 👈 NUEVO
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
        setPaso1Data,
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
