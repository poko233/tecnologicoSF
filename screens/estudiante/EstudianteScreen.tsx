import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../components/ThemedText";
import { httpClient } from "../../http/httpClient";
import { useTheme } from "../../theme/useTheme";

import EstudianteEditModal from "./components/EstudianteEditModal";
import EstudiantesTable from "./components/EstudiantesTable";
import HistorialEstudianteModal from "./components/HistorialEstudianteModal";
import { useEstudiantes } from "./hooks/useEstudiantes";
import { createEstudianteScreenStyles } from "./styles/estudianteScreen.styles";
import {
  FiltrosEstudiantes,
  OrdenEstudiantes,
  filtrarYOrdenarEstudiantes,
} from "./utils/estudianteListado";
export type { FiltrosEstudiantes } from "./utils/estudianteListado";

import {
  EstudianteForm,
  EstudianteUsuario,
  FotoEstudianteArchivo,
  HistorialEstudianteResponse,
} from "./types/estudiante.types";

function valorTextoPreferido(
  nuevo?: string | null,
  anterior?: string | null,
): string | null | undefined {
  const valorNuevo = String(nuevo ?? "").trim();

  if (
    nuevo === undefined ||
    nuevo === null ||
    valorNuevo === "" ||
    valorNuevo === "0" ||
    valorNuevo.toLowerCase() === "null" ||
    valorNuevo.toLowerCase() === "undefined"
  ) {
    return anterior;
  }

  return nuevo;
}

/**
 * El endpoint del historial puede devolver un estudiante resumido.
 * Esta función lo combina con el estudiante completo sin perder la foto,
 * fotoUrl, documentos, carreras, QR ni otras relaciones ya cargadas.
 */
function fusionarEstudianteParaHistorial(
  base: EstudianteUsuario | null | undefined,
  detalle: EstudianteUsuario | null | undefined,
  resumen: EstudianteUsuario | null | undefined,
): EstudianteUsuario | null {
  const primero = base ?? detalle ?? resumen;

  if (!primero) return null;

  const combinado: EstudianteUsuario = {
    ...base,
    ...detalle,
    ...resumen,
  } as EstudianteUsuario;

  combinado.foto = valorTextoPreferido(
    resumen?.foto,
    valorTextoPreferido(detalle?.foto, base?.foto),
  );

  combinado.fotoUrl = valorTextoPreferido(
    resumen?.fotoUrl,
    valorTextoPreferido(detalle?.fotoUrl, base?.fotoUrl),
  );

  combinado.codigo_qr = valorTextoPreferido(
    resumen?.codigo_qr,
    valorTextoPreferido(detalle?.codigo_qr, base?.codigo_qr),
  );

  combinado.qrUrl = valorTextoPreferido(
    resumen?.qrUrl,
    valorTextoPreferido(detalle?.qrUrl, base?.qrUrl),
  );

  combinado.documentos =
    resumen?.documentos ??
    detalle?.documentos ??
    base?.documentos;

  combinado.carreras =
    resumen?.carreras ??
    detalle?.carreras ??
    base?.carreras;

  combinado.roles =
    resumen?.roles ??
    detalle?.roles ??
    base?.roles;

  combinado.promociones =
    resumen?.promociones ??
    detalle?.promociones ??
    base?.promociones;

  combinado.numeroReferencias =
    resumen?.numeroReferencias ??
    detalle?.numeroReferencias ??
    base?.numeroReferencias;

  combinado.numero_referencias =
    resumen?.numero_referencias ??
    detalle?.numero_referencias ??
    base?.numero_referencias;

  return combinado;
}

export default function EstudianteScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const styles = useMemo(
    () => createEstudianteScreenStyles(theme.colors),
    [theme.colors],
  );

  const {
    estudiantes,
    loading,
    cargandoDetalle,
    guardando,
    subiendoFoto,
    cargarEstudiantes,
    cargarDetalleEstudiante,
    cargarHistorialEstudiante,
    guardarDatosEstudiante,
    guardarFotoEstudiante,
  } = useEstudiantes();

  const [estudianteSeleccionado, setEstudianteSeleccionado] =
    useState<EstudianteUsuario | null>(null);

  const [estudianteHistorial, setEstudianteHistorial] =
    useState<EstudianteUsuario | null>(null);

  const [historialEstudiante, setHistorialEstudiante] =
    useState<HistorialEstudianteResponse | null>(null);

  const [historialEstudianteVisible, setHistorialEstudianteVisible] =
    useState(false);

  const [filtros, setFiltros] = useState<FiltrosEstudiantes>({
    tipo: "",
    idCarrera: "",
    nivel: "",
    documentos: "",
  });

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<OrdenEstudiantes>("inscripcion_desc");

  const estudiantesDelListado = useMemo(
    () =>
      filtrarYOrdenarEstudiantes(
        estudiantes,
        filtros,
        busqueda,
        orden,
      ),
    [estudiantes, filtros, busqueda, orden],
  );

  const detalleRequestRef = useRef(0);
  const detalleAbiertoIdRef = useRef<number | null>(null);

  /*
   * Control propio del historial. Cada apertura genera un identificador.
   * Al cerrar, el identificador cambia y cualquier respuesta anterior se
   * descarta, por lo que el modal no vuelve a abrirse ni actualiza datos.
   */
  const historialRequestRef = useRef(0);
  const historialAbiertoIdRef = useRef<number | null>(null);
  const [cargandoHistorialModal, setCargandoHistorialModal] = useState(false);

  const abrirDetalle = async (estudiante: EstudianteUsuario) => {
    const requestId = detalleRequestRef.current + 1;
    detalleRequestRef.current = requestId;
    detalleAbiertoIdRef.current = estudiante.id;

    /*
     * Se abre inmediatamente con la información del listado para evitar una
     * pantalla vacía, pero después se reemplaza solamente con el detalle
     * fresco del mismo estudiante.
     */
    setEstudianteSeleccionado(estudiante);

    const detalle = await cargarDetalleEstudiante(estudiante.id, true);

    const sigueSiendoLaMismaSolicitud =
      detalleRequestRef.current === requestId &&
      detalleAbiertoIdRef.current === estudiante.id;

    if (detalle && sigueSiendoLaMismaSolicitud) {
      setEstudianteSeleccionado(detalle);
    }
  };

  const cerrarDetalleForzado = () => {
    /*
     * Invalida cualquier petición pendiente. Así una respuesta atrasada no
     * puede volver a mostrar el modal después de cerrar o guardar.
     */
    detalleRequestRef.current += 1;
    detalleAbiertoIdRef.current = null;
    setEstudianteSeleccionado(null);
  };

  const cerrarDetalle = () => {
    if (guardando || subiendoFoto) return;

    cerrarDetalleForzado();
  };

  const abrirHistorialEstudiante = async (estudiante: EstudianteUsuario) => {
    const requestId = historialRequestRef.current + 1;

    historialRequestRef.current = requestId;
    historialAbiertoIdRef.current = Number(estudiante.id);

    setEstudianteHistorial(estudiante);
    setHistorialEstudiante(null);
    setHistorialEstudianteVisible(true);
    setCargandoHistorialModal(true);

    try {
      /*
       * El historial y el detalle se cargan en paralelo.
       * El detalle contiene fotoUrl usando FOTOS_PUBLIC_URL, mientras que el
       * historial puede devolver solamente un resumen del estudiante.
       */
      const [data, detalle] = await Promise.all([
        cargarHistorialEstudiante(estudiante.id, true),
        cargarDetalleEstudiante(estudiante.id, true),
      ]);

      const solicitudSigueActiva =
        historialRequestRef.current === requestId &&
        historialAbiertoIdRef.current === Number(estudiante.id);

      if (!solicitudSigueActiva) {
        return;
      }

      if (data) {
        const estudianteCompleto = fusionarEstudianteParaHistorial(
          estudiante,
          detalle,
          data.estudiante,
        );

        const historialCompleto: HistorialEstudianteResponse = {
          ...data,
          estudiante: estudianteCompleto ?? data.estudiante,
        };

        setHistorialEstudiante(historialCompleto);
        setEstudianteHistorial(estudianteCompleto ?? estudiante);
      } else if (detalle) {
        setEstudianteHistorial(
          fusionarEstudianteParaHistorial(estudiante, detalle, null) ??
            estudiante,
        );
      }
    } finally {
      const solicitudSigueActiva =
        historialRequestRef.current === requestId &&
        historialAbiertoIdRef.current === Number(estudiante.id);

      if (solicitudSigueActiva) {
        setCargandoHistorialModal(false);
      }
    }
  };

  const cerrarHistorialEstudiante = () => {
    /*
     * Puede cerrarse incluso durante la carga. Incrementar el identificador
     * cancela lógicamente la solicitud: su respuesta será ignorada.
     */
    historialRequestRef.current += 1;
    historialAbiertoIdRef.current = null;

    setCargandoHistorialModal(false);
    setHistorialEstudianteVisible(false);
    setHistorialEstudiante(null);
    setEstudianteHistorial(null);
  };

  const guardarDatos = async (
    id: number,
    form: EstudianteForm,
  ): Promise<EstudianteUsuario | null> => {
    const actualizado = await guardarDatosEstudiante(id, form);

    /*
     * El hook devuelve null cuando hubo un error. Por eso el modal solo se
     * cierra cuando el backend confirmó correctamente la actualización.
     */
    if (actualizado) {
      cerrarDetalleForzado();
    }

    return actualizado;
  };

  const guardarFoto = async (id: number, archivo: FotoEstudianteArchivo) => {
    const actualizado = await guardarFotoEstudiante(id, archivo);

    if (
      actualizado &&
      detalleAbiertoIdRef.current === Number(actualizado.id)
    ) {
      setEstudianteSeleccionado(actualizado);
    }

    return actualizado;
  };

  const recargarDetalle = async (idUsuario: number) => {
    const requestId = detalleRequestRef.current + 1;
    detalleRequestRef.current = requestId;

    const actualizado = await cargarDetalleEstudiante(idUsuario, true);

    const sigueAbierto =
      detalleRequestRef.current === requestId &&
      detalleAbiertoIdRef.current === Number(idUsuario);

    if (actualizado && sigueAbierto) {
      setEstudianteSeleccionado(actualizado);
    }
  };

  const abrirReporteDocumentos = async () => {
    const nuevaVentana =
      Platform.OS === "web" ? window.open("", "_blank") : null;

    try {
      const params = new URLSearchParams();

      if (filtros.tipo) params.append("tipo", filtros.tipo);
      if (filtros.idCarrera) params.append("idCarrera", filtros.idCarrera);
      if (filtros.nivel) params.append("nivel", filtros.nivel);
      if (filtros.documentos) {
        params.append("documentos", filtros.documentos);
      }
      if (busqueda.trim()) params.append("buscar", busqueda.trim());

      params.append("orden", orden);
      params.append(
        "ids",
        estudiantesDelListado.length > 0
          ? estudiantesDelListado.map((item) => item.id).join(",")
          : "0",
      );

      const query = params.toString();

      const path = query
        ? `/api/estudiantes-usuarios/reporte-documentos-faltantes?${query}`
        : "/api/estudiantes-usuarios/reporte-documentos-faltantes";

      const response = await httpClient._rawFetch(path, "application/pdf");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (Platform.OS === "web") {
        if (nuevaVentana) {
          nuevaVentana.location.href = blobUrl;
        } else {
          window.open(blobUrl, "_blank");
        }

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      }
    } catch (error: any) {
      if (nuevaVentana) {
        nuevaVentana.close();
      }

      Toast.show({
        type: "error",
        text1: "No se pudo generar el reporte",
        text2: error?.message || "Intenta nuevamente.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.kicker}>Estudiantes</ThemedText>

              <ThemedText style={styles.title}>
                Información de estudiantes
              </ThemedText>

              <ThemedText style={styles.subtitle}>
                Administra los datos personales, contacto, referencia,
                documentos, foto, código QR e historial del estudiante.
              </ThemedText>
            </View>

            <Pressable
              onPress={abrirReporteDocumentos}
              style={({ pressed }) => [
                styles.reportBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={colors.primaryForeground}
              />

              <ThemedText style={styles.reportBtnText}>
                Reporte de documentos adeudados
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <EstudiantesTable
          estudiantes={estudiantes}
          loading={loading}
          filtros={filtros}
          busqueda={busqueda}
          orden={orden}
          onFiltrosChange={setFiltros}
          onBusquedaChange={setBusqueda}
          onOrdenChange={setOrden}
          onVerDetalle={abrirDetalle}
          onVerHistorialEstudiante={abrirHistorialEstudiante}
          onRefresh={() => cargarEstudiantes(true)}
        />
      </ScrollView>

      <EstudianteEditModal
        visible={!!estudianteSeleccionado}
        estudiante={estudianteSeleccionado}
        cargandoDetalle={cargandoDetalle}
        guardando={guardando}
        subiendoFoto={subiendoFoto}
        onClose={cerrarDetalle}
        onSave={guardarDatos}
        onFotoActualizada={guardarFoto}
        onDocumentoSubido={recargarDetalle}
      />

      <HistorialEstudianteModal
        visible={historialEstudianteVisible}
        estudiante={estudianteHistorial}
        historial={historialEstudiante}
        loading={cargandoHistorialModal}
        onClose={cerrarHistorialEstudiante}
      />
    </View>
  );
}