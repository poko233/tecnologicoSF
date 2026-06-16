import { httpClient } from "@http";
import { Platform } from 'react-native';
import {
    ApiResponse,
    ArchivoImagen,
    CAMPOS_IMAGEN_EMPRESA,
    Empresa,
    EmpresaFormData,
} from "../types/empresa.types";

/**
 * Endpoints (coinciden con tu Route::prefix('empresa')):
 *   GET   /empresa   -> EmpresaController@show
 *   PATCH /empresa   -> EmpresaController@update
 */
const ENDPOINT = "/api/empresa";

/**
 * GET /empresa
 * httpClient.getAuth ya lanza { status, message } si !res.ok,
 * y devuelve el JSON parseado (ApiResponse<Empresa>) si res.ok.
 */
export async function obtenerEmpresa(): Promise<Empresa> {
  const data = await httpClient.getAuth<ApiResponse<Empresa>>(
    ENDPOINT,
    "Error al obtener configuración de empresa.",
  );

  if (!data.success || !data.data) {
    throw {
      status: 200,
      message:
        data.message ?? "No se pudo obtener la configuración de empresa.",
    };
  }

  return data.data;
}

/**
 * PATCH /empresa
 *
 * - Si NO hay imágenes nuevas: usa putAuth/patchAuth con JSON normal
 *   (más liviano, sin FormData).
 * - Si HAY imágenes nuevas: construye FormData y usa
 *   httpClient.patchFormData (ver AGREGAR_A_httpClient.ts), que hace
 *   POST + _method=PATCH para que Laravel reciba los archivos.
 *
 * En ambos casos httpClient ya lanza { status, message, errors } en
 * caso de error, así que el hook solo necesita capturar ese objeto.
 */
export async function actualizarEmpresa(
  datos: EmpresaFormData,
  imagenes?: Partial<Record<string, ArchivoImagen>>,
): Promise<Empresa> {
  const hayImagenes = Object.values(imagenes ?? {}).some(Boolean);

  const data = hayImagenes
    ? await actualizarConImagenes(datos, imagenes!)
    : await actualizarSoloDatos(datos);

  if (!data.success || !data.data) {
    throw {
      status: 200,
      message:
        data.message ?? "No se pudo actualizar la configuración de empresa.",
    };
  }

  return data.data;
}

/**
 * Caso sin archivos: PATCH normal con JSON.
 * httpClient no expone `patchAuth`, pero PATCH y PUT llegan al mismo
 * EmpresaController@update; usamos putAuth y dejamos que el backend
 * reciba el body igual. Si tu backend valida el VERBO exacto y rechaza
 * PUT, dime y te agrego un `patchAuth` idéntico a `putAuth` con method: "PATCH".
 */
async function actualizarSoloDatos(
  datos: EmpresaFormData,
): Promise<ApiResponse<Empresa>> {
  return httpClient.putAuth<ApiResponse<Empresa>>(
    ENDPOINT,
    datos,
    "Error al actualizar la configuración.",
  );
}

/**
 * Caso con archivos: FormData + patchFormData (POST con _method=PATCH).
 */
async function actualizarConImagenes(
  datos: EmpresaFormData,
  imagenes: Partial<Record<string, ArchivoImagen>>,
): Promise<ApiResponse<Empresa>> {
  const formData = new FormData();

  Object.entries(datos).forEach(([clave, valor]) => {
    if (valor === undefined || valor === null || valor === '') {
      return;
    }
    formData.append(clave, String(valor));
  });

  for (const campo of CAMPOS_IMAGEN_EMPRESA) {
    const archivo = imagenes[campo];
    if (!archivo) continue;

    if (Platform.OS === 'web') {
      // En web: convertir uri (blob:/data:) a Blob real
      const response = await fetch(archivo.uri);
      const blob = await response.blob();
      formData.append(campo, blob, archivo.name);
    } else {
      // Nativo: objeto {uri, name, type} funciona normal
      formData.append(campo, {
        uri: archivo.uri,
        name: archivo.name,
        type: archivo.type,
      } as any);
    }
  }

  return httpClient.patchFormData<ApiResponse<Empresa>>(ENDPOINT, formData);
}