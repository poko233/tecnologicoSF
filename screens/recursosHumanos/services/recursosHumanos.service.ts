import { httpClient } from "../../../http/httpClient";
import {
    UsuarioRRHH,
    UsuarioRRHHForm,
} from "../types/recursosHumanos.types";

type UsuariosResponse = {
  usuarios: UsuarioRRHH[];
};

type UsuarioResponse = {
  message: string;
  usuario: UsuarioRRHH;
};

export async function listarUsuariosRRHH() {
  const data = await httpClient.getAuth<UsuariosResponse>(
    "/api/recursos-humanos/usuarios",
    "No se pudieron cargar los usuarios",
  );

  return data.usuarios || [];
}

export async function actualizarUsuarioRRHH(
  id: number,
  form: UsuarioRRHHForm,
) {
  const data = await httpClient.putAuth<UsuarioResponse>(
    `/api/recursos-humanos/usuarios/${id}`,
    form,
    "No se pudo actualizar el usuario",
  );

  return data.usuario;
}