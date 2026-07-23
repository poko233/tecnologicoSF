import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { createEstudiantesTableStyles } from "../styles/estudiantesTable.styles";
import { EstudianteUsuario } from "../types/estudiante.types";
import {
  esEstadoActivo,
  nombreCompleto,
  normalizarEstado,
  normalizarTipoCarrera,
  obtenerCarrerasEstudiante,
  obtenerCarrerasTexto,
  obtenerFechaInscripcion,
  obtenerIniciales,
  obtenerLabelNivelPorRegimen,
  obtenerMatricula,
  obtenerNivelesDeCarreraEstudiante,
  obtenerNivelesTexto,
  obtenerPromocionActual,
  obtenerReferencia,
  obtenerTipoCarreraLabel,
  obtenerTiposCarreraTexto,
} from "../utils/estudiante.helpers";
import {
  DOCUMENTACION_ESTUDIANTES_OPTIONS,
  FiltrosEstudiantes,
  ORDEN_ESTUDIANTES_OPTIONS,
  OrdenEstudiantes,
  filtrarYOrdenarEstudiantes,
  obtenerDocumentacionEstudiantesLabel,
  obtenerOrdenEstudiantesLabel,
} from "../utils/estudianteListado";

type Props = {
  estudiantes: EstudianteUsuario[];
  loading: boolean;
  filtros: FiltrosEstudiantes;
  busqueda: string;
  orden: OrdenEstudiantes;
  onFiltrosChange: (filtros: FiltrosEstudiantes) => void;
  onBusquedaChange: (value: string) => void;
  onOrdenChange: (orden: OrdenEstudiantes) => void;
  onVerDetalle: (estudiante: EstudianteUsuario) => void;
  onVerHistorialEstudiante: (estudiante: EstudianteUsuario) => void;
  onRefresh: () => void;
};

type FilterKey = "tipo" | "carrera" | "nivel" | "documentos" | "orden";
type TableStyles = ReturnType<typeof createEstudiantesTableStyles>;

type CarreraFiltro = {
  idCarrera: string;
  nombreCarrera: string;
  codigo?: string;
  regimen?: string;
  tipo?: string;
};

const PAGE_SIZE = 8;

function ordenarTexto(a: string, b: string) {
  return a.localeCompare(b, "es", {
    numeric: true,
    sensitivity: "base",
  });
}

function uniqueCarreras(carreras: CarreraFiltro[]) {
  const map = new Map<string, CarreraFiltro>();

  carreras.forEach((carrera) => {
    if (!map.has(carrera.idCarrera)) {
      map.set(carrera.idCarrera, carrera);
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    ordenarTexto(a.nombreCarrera, b.nombreCarrera),
  );
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort(ordenarTexto);
}

export default function EstudiantesTable({
  estudiantes,
  loading,
  filtros,
  busqueda,
  orden,
  onFiltrosChange,
  onBusquedaChange,
  onOrdenChange,
  onVerDetalle,
  onVerHistorialEstudiante,
  onRefresh,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { width } = useWindowDimensions();

  const isMobile = width < 760;
  const isCompact = width < 1120;
  const primaryForeground = colors.primaryForeground || "#FFFFFF";

  const styles = useMemo(
    () => createEstudiantesTableStyles(colors, isMobile, isCompact),
    [colors, isMobile, isCompact],
  );

  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);

  const filtroTipo = filtros.tipo;
  const filtroCarrera = filtros.idCarrera;
  const filtroNivel = filtros.nivel;
  const filtroDocumentos = filtros.documentos;

  const setFiltroTipo = (tipo: string) => {
    onFiltrosChange({
      tipo,
      idCarrera: "",
      nivel: "",
      documentos: filtros.documentos,
    });
  };

  const setFiltroCarrera = (idCarrera: string) => {
    onFiltrosChange({
      ...filtros,
      idCarrera,
      nivel: "",
    });
  };

  const setFiltroNivel = (nivel: string) => {
    onFiltrosChange({
      ...filtros,
      nivel,
    });
  };

  const setFiltroDocumentos = (
    documentos: FiltrosEstudiantes["documentos"],
  ) => {
    onFiltrosChange({
      ...filtros,
      documentos,
    });
  };

  const tipoOptions = useMemo(() => ["CARRERA", "CURSO"], []);

  const carreraOptions = useMemo(() => {
    const carreras = estudiantes.flatMap((estudiante) =>
      obtenerCarrerasEstudiante(estudiante),
    ) as CarreraFiltro[];

    const carrerasFiltradas = filtroTipo
      ? carreras.filter(
          (carrera) => normalizarTipoCarrera(carrera.tipo) === filtroTipo,
        )
      : carreras;

    return uniqueCarreras(carrerasFiltradas);
  }, [estudiantes, filtroTipo]);

  const carreraSeleccionada = useMemo(
    () =>
      carreraOptions.find(
        (carrera) => String(carrera.idCarrera) === String(filtroCarrera),
      ),
    [carreraOptions, filtroCarrera],
  );

  const labelNivel = obtenerLabelNivelPorRegimen(
    carreraSeleccionada?.regimen,
  );

  const nivelOptions = useMemo(() => {
    if (!filtroCarrera) return [];

    return uniqueSorted(
      estudiantes
        .filter((estudiante) =>
          obtenerCarrerasEstudiante(estudiante).some(
            (carrera: any) =>
              String(carrera.idCarrera) === String(filtroCarrera),
          ),
        )
        .flatMap((estudiante) =>
          obtenerNivelesDeCarreraEstudiante(estudiante, filtroCarrera),
        ),
    );
  }, [estudiantes, filtroCarrera]);

  const hayFiltrosActivos =
    !!filtroTipo ||
    !!filtroCarrera ||
    !!filtroNivel ||
    !!filtroDocumentos;

  const data = useMemo(
    () =>
      filtrarYOrdenarEstudiantes(
        estudiantes,
        filtros,
        busqueda,
        orden,
      ),
    [estudiantes, filtros, busqueda, orden],
  );

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [
    busqueda,
    filtroTipo,
    filtroCarrera,
    filtroNivel,
    filtroDocumentos,
    orden,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!filtroTipo || !filtroCarrera) return;

    const carreraExisteEnTipo = carreraOptions.some(
      (carrera) => String(carrera.idCarrera) === String(filtroCarrera),
    );

    if (!carreraExisteEnTipo) {
      onFiltrosChange({
        tipo: filtroTipo,
        idCarrera: "",
        nivel: "",
        documentos: filtroDocumentos,
      });
    }
  }, [
    filtroTipo,
    filtroCarrera,
    carreraOptions,
    onFiltrosChange,
  ]);

  const limpiarBusqueda = () => {
    onBusquedaChange("");
    setPage(1);
  };

  const limpiarFiltros = () => {
    onFiltrosChange({
      tipo: "",
      idCarrera: "",
      nivel: "",
      documentos: "",
    });

    setActiveFilter(null);
    setPage(1);
  };

  const renderDropdown = () => {
    if (!activeFilter) return null;

    if (activeFilter === "tipo") {
      return (
        <DropdownPanel
          title="Filtrar por tipo"
          empty="No hay tipos registrados."
          options={[
            { label: "Todos", value: "" },
            ...tipoOptions.map((tipo) => ({
              label: obtenerTipoCarreraLabel(tipo),
              value: tipo,
            })),
          ]}
          selectedValue={filtroTipo}
          colors={colors}
          styles={styles}
          onClose={() => setActiveFilter(null)}
          onSelect={(value) => {
            setFiltroTipo(value);
            setActiveFilter(null);
          }}
        />
      );
    }

    if (activeFilter === "carrera") {
      return (
        <DropdownPanel
          title="Filtrar por carrera"
          empty="No hay carreras registradas."
          options={[
            { label: "Todas", value: "" },
            ...carreraOptions.map((carrera) => ({
              label: `${carrera.nombreCarrera}${
                carrera.regimen ? ` · ${carrera.regimen}` : ""
              }${
                carrera.tipo
                  ? ` · ${obtenerTipoCarreraLabel(carrera.tipo)}`
                  : ""
              }`,
              value: String(carrera.idCarrera),
            })),
          ]}
          selectedValue={filtroCarrera}
          colors={colors}
          styles={styles}
          onClose={() => setActiveFilter(null)}
          onSelect={(value) => {
            setFiltroCarrera(value);
            setActiveFilter(null);
          }}
        />
      );
    }

    if (activeFilter === "nivel") {
      return (
        <DropdownPanel
          title={`Filtrar por ${labelNivel.toLowerCase()}`}
          empty={`No hay ${labelNivel.toLowerCase()}s registrados para esta carrera.`}
          options={[
            {
              label: `Todos los ${labelNivel.toLowerCase()}s`,
              value: "",
            },
            ...nivelOptions.map((nivel) => ({ label: nivel, value: nivel })),
          ]}
          selectedValue={filtroNivel}
          colors={colors}
          styles={styles}
          onClose={() => setActiveFilter(null)}
          onSelect={(value) => {
            setFiltroNivel(value);
            setActiveFilter(null);
          }}
        />
      );
    }

    if (activeFilter === "documentos") {
      return (
        <DropdownPanel
          title="Filtrar por documentación"
          empty="No hay opciones de documentación."
          options={DOCUMENTACION_ESTUDIANTES_OPTIONS}
          selectedValue={filtroDocumentos}
          colors={colors}
          styles={styles}
          onClose={() => setActiveFilter(null)}
          onSelect={(value) => {
            setFiltroDocumentos(
              value as FiltrosEstudiantes["documentos"],
            );
            setActiveFilter(null);
          }}
        />
      );
    }

    return (
      <DropdownPanel
        title="Ordenar estudiantes"
        empty="No hay opciones de orden."
        options={ORDEN_ESTUDIANTES_OPTIONS}
        selectedValue={orden}
        colors={colors}
        styles={styles}
        onClose={() => setActiveFilter(null)}
        onSelect={(value) => {
          onOrdenChange(value as OrdenEstudiantes);
          setActiveFilter(null);
        }}
      />
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.topTextBox}>
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Ionicons
                name="school-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.titleTextBox}>
              <ThemedText style={styles.title}>
                Estudiantes registrados
              </ThemedText>

              <ThemedText style={styles.subtitle}>
                {data.length} estudiante(s) encontrados
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filtersPrimaryRow}>
            <View style={styles.primaryFilterItem}>
              <FilterButton
                label="Tipo"
                value={
                  filtroTipo
                    ? obtenerTipoCarreraLabel(filtroTipo)
                    : "Todos"
                }
                selected={!!filtroTipo}
                open={activeFilter === "tipo"}
                fluid
                colors={colors}
                styles={styles}
                onPress={() =>
                  setActiveFilter((current) =>
                    current === "tipo" ? null : "tipo",
                  )
                }
              />
            </View>

            <View style={styles.primaryFilterItem}>
              <FilterButton
                label="Carrera"
                value={carreraSeleccionada?.nombreCarrera || "Todas"}
                selected={!!filtroCarrera}
                open={activeFilter === "carrera"}
                fluid
                colors={colors}
                styles={styles}
                onPress={() =>
                  setActiveFilter((current) =>
                    current === "carrera" ? null : "carrera",
                  )
                }
              />
            </View>

            <View style={styles.primaryFilterItem}>
              <FilterButton
                label={labelNivel}
                value={
                  !filtroCarrera
                    ? "Elige carrera"
                    : filtroNivel || "Todos"
                }
                selected={!!filtroNivel}
                open={activeFilter === "nivel"}
                disabled={!filtroCarrera}
                fluid
                colors={colors}
                styles={styles}
                onPress={() => {
                  if (!filtroCarrera) return;

                  setActiveFilter((current) =>
                    current === "nivel" ? null : "nivel",
                  );
                }}
              />
            </View>
          </View>

          <View style={styles.filtersSecondaryRow}>
            <View style={styles.secondaryFilterItem}>
              <FilterButton
                label="Documentos"
                value={obtenerDocumentacionEstudiantesLabel(
                  filtroDocumentos,
                )}
                selected={!!filtroDocumentos}
                open={activeFilter === "documentos"}
                fluid
                colors={colors}
                styles={styles}
                onPress={() =>
                  setActiveFilter((current) =>
                    current === "documentos" ? null : "documentos",
                  )
                }
              />
            </View>

            <View style={styles.secondaryFilterItem}>
              <FilterButton
                label="Orden"
                value={obtenerOrdenEstudiantesLabel(orden)}
                selected={orden !== "inscripcion_desc"}
                open={activeFilter === "orden"}
                fluid
                colors={colors}
                styles={styles}
                onPress={() =>
                  setActiveFilter((current) =>
                    current === "orden" ? null : "orden",
                  )
                }
              />
            </View>

            <View style={styles.filterActions}>
              {hayFiltrosActivos && (
                <Pressable
                  onPress={limpiarFiltros}
                  style={({ pressed }) => [
                    styles.filterClearBtn,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Ionicons
                    name="funnel-outline"
                    size={16}
                    color={colors.text}
                  />

                  <ThemedText style={styles.filterClearText}>
                    Limpiar
                  </ThemedText>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.refreshBtn,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={onRefresh}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={primaryForeground}
                />

                <ThemedText style={styles.refreshText}>
                  Actualizar
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {renderDropdown()}

      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={19}
          color={colors.textMuted || colors.textSecondary}
        />

        <TextInput
          value={busqueda}
          onChangeText={onBusquedaChange}
          placeholder="Buscar por nombre, CI, matrícula, tipo, carrera, nivel, correo, celular, referencia, estado o promoción..."
          placeholderTextColor={colors.textMuted || colors.textSecondary}
          style={styles.searchInput}
        />

        {!!busqueda && (
          <Pressable onPress={limpiarBusqueda} hitSlop={8}>
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={colors.textMuted || colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
          <ThemedText style={styles.loadingText}>
            Cargando estudiantes...
          </ThemedText>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="school-outline"
              size={40}
              color={colors.textMuted || colors.textSecondary}
            />
          </View>

          <ThemedText style={styles.emptyTitle}>
            No se encontraron estudiantes
          </ThemedText>

          <ThemedText style={styles.emptyText}>
            Prueba con otro filtro de carrera, nivel, documentación, búsqueda u orden.
          </ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.tableShell}>
            {!isMobile && (
              <View style={styles.headerRow}>
                {isCompact ? (
                  <>
                    <ThemedText
                      style={[styles.headerText, styles.headerUsuarioCompact]}
                    >
                      Estudiante
                    </ThemedText>
                    <ThemedText
                      style={[styles.headerText, styles.headerDatosCompact]}
                    >
                      Datos y académico
                    </ThemedText>
                    <ThemedText
                      style={[styles.headerText, styles.headerEstadoCompact]}
                    >
                      Estado
                    </ThemedText>
                    <ThemedText
                      style={[styles.headerText, styles.headerAccionCompact]}
                    >
                      Acción
                    </ThemedText>
                  </>
                ) : (
                  <>
                    <ThemedText style={[styles.headerText, styles.headerUsuario]}>
                      Estudiante
                    </ThemedText>
                    <ThemedText style={[styles.headerText, styles.headerContacto]}>
                      Contacto
                    </ThemedText>
                    <ThemedText style={[styles.headerText, styles.headerAcademico]}>
                      Académico
                    </ThemedText>
                    <ThemedText style={[styles.headerText, styles.headerReferencia]}>
                      Referencia y promoción
                    </ThemedText>
                    <ThemedText style={[styles.headerText, styles.headerEstado]}>
                      Estado
                    </ThemedText>
                    <ThemedText style={[styles.headerText, styles.headerAccion]}>
                      Acción
                    </ThemedText>
                  </>
                )}
              </View>
            )}

            <View style={styles.rowsBox}>
              {paginatedData.map((estudiante, index) => {
                const nombre = nombreCompleto(estudiante);
                const referencia = obtenerReferencia(estudiante);
                const estadoActivo = esEstadoActivo(estudiante.estado);
                const cantidadDocs = estudiante.documentos?.length ?? 0;
                const promocion = obtenerPromocionActual(estudiante);
                const matricula = obtenerMatricula(estudiante);
                const fechaInscripcion = obtenerFechaInscripcion(estudiante);
                const tipoTexto = obtenerTiposCarreraTexto(estudiante);
                const carreraTexto = obtenerCarrerasTexto(estudiante);
                const nivelTexto = obtenerNivelesTexto(estudiante);

                if (isMobile) {
                  return (
                    <MobileEstudianteCard
                      key={estudiante.id}
                      estudiante={estudiante}
                      nombre={nombre}
                      referencia={referencia}
                      cantidadDocs={cantidadDocs}
                      estadoActivo={estadoActivo}
                      matricula={matricula}
                      fechaInscripcion={fechaInscripcion}
                      promocion={promocion}
                      tipoTexto={tipoTexto}
                      carreraTexto={carreraTexto}
                      nivelTexto={nivelTexto}
                      colors={colors}
                      styles={styles}
                      onVer={() => onVerDetalle(estudiante)}
                      onHistorial={() =>
                        onVerHistorialEstudiante(estudiante)
                      }
                    />
                  );
                }

                return (
                  <View
                    key={estudiante.id}
                    style={[styles.row, index % 2 === 1 && styles.rowAlt]}
                  >
                    {isCompact ? (
                      <>
                        <View style={styles.usuarioCompactCell}>
                          <EstudianteResumen
                            estudiante={estudiante}
                            nombre={nombre}
                            colors={colors}
                            styles={styles}
                            compacto
                          />
                        </View>

                        <View style={styles.datosCompactCell}>
                          <ThemedText numberOfLines={1} style={styles.compactPrimary}>
                            Matrícula: {matricula}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.compactSecondary}>
                            Tipo: {tipoTexto}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.compactSecondary}>
                            Carrera: {carreraTexto}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.compactSecondary}>
                            Nivel: {nivelTexto}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.observacionCompact}>
                            Promo: {promocion || "Sin promoción"} · Docs: {cantidadDocs}
                          </ThemedText>
                        </View>

                        <View style={styles.estadoCompactCell}>
                          <EstadoBadge
                            estado={estudiante.estado}
                            activo={estadoActivo}
                            styles={styles}
                          />
                        </View>

                        <View style={styles.accionCompactCell}>
                          <ActionButtons
                            compact
                            colors={colors}
                            onVer={() => onVerDetalle(estudiante)}
                            onHistorial={() =>
                              onVerHistorialEstudiante(estudiante)
                            }
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.usuarioCell}>
                          <EstudianteResumen
                            estudiante={estudiante}
                            nombre={nombre}
                            colors={colors}
                            styles={styles}
                          />
                        </View>

                        <View style={styles.contactoCell}>
                          <ThemedText numberOfLines={1} style={styles.contactPrimary}>
                            {estudiante.email || "Sin correo"}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.contactSecondary}>
                            {estudiante.celular || "Sin celular"}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.contactSecondary}>
                            CI: {estudiante.ci || "—"}{" "}
                            {estudiante.expedido ? `· ${estudiante.expedido}` : ""}
                          </ThemedText>
                        </View>

                        <View style={styles.academicoCell}>
                          <ThemedText numberOfLines={1} style={styles.infoPrimary}>
                            {matricula}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.infoSecondary}>
                            Tipo: {tipoTexto}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.infoSecondary}>
                            Carrera: {carreraTexto}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.infoSecondary}>
                            Nivel: {nivelTexto}
                          </ThemedText>
                          <View style={styles.docsLine}>
                            <Ionicons
                              name="document-text-outline"
                              size={14}
                              color={colors.primary}
                            />
                            <ThemedText style={styles.docsText}>
                              {cantidadDocs} documento(s)
                            </ThemedText>
                          </View>
                        </View>

                        <View style={styles.referenciaCell}>
                          <ThemedText numberOfLines={1} style={styles.referenciaText}>
                            {referencia?.nombreContactoReferencia
                              ? `${referencia.nombreContactoReferencia}${
                                  referencia.parentesco
                                    ? ` · ${referencia.parentesco}`
                                    : ""
                                }`
                              : "Sin referencia"}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.observacionText}>
                            {referencia?.numeroReferencia
                              ? `Cel: ${referencia.numeroReferencia}`
                              : "Sin número de referencia"}
                          </ThemedText>
                          <ThemedText numberOfLines={1} style={styles.observacionText}>
                            Promo: {promocion || "Sin promoción"}
                          </ThemedText>
                        </View>

                        <View style={styles.estadoCell}>
                          <EstadoBadge
                            estado={estudiante.estado}
                            activo={estadoActivo}
                            styles={styles}
                          />
                        </View>

                        <View style={styles.accionCell}>
                          <ActionButtons
                            colors={colors}
                            onVer={() => onVerDetalle(estudiante)}
                            onHistorial={() =>
                              onVerHistorialEstudiante(estudiante)
                            }
                          />
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={[styles.pagination, isMobile && styles.paginationMobile]}>
            <View style={styles.pageInfo}>
              <ThemedText style={styles.pageInfoText}>
                Página {currentPage} de {totalPages}
              </ThemedText>
              <ThemedText style={styles.pageInfoSub}>
                Mostrando {paginatedData.length} de {data.length}
              </ThemedText>
            </View>

            <View style={styles.pageActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.pageBtn,
                  currentPage <= 1 && styles.disabled,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
                disabled={currentPage <= 1}
                onPress={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={18}
                  color={primaryForeground}
                />
                {!isMobile && (
                  <ThemedText style={styles.pageBtnText}>Anterior</ThemedText>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.pageBtn,
                  currentPage >= totalPages && styles.disabled,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
                disabled={currentPage >= totalPages}
                onPress={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                {!isMobile && (
                  <ThemedText style={styles.pageBtnText}>Siguiente</ThemedText>
                )}
                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color={primaryForeground}
                />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function FilterButton({
  label,
  value,
  selected = false,
  open = false,
  disabled = false,
  wide = false,
  fluid = false,
  colors,
  styles,
  onPress,
}: {
  label: string;
  value: string;
  selected?: boolean;
  open?: boolean;
  disabled?: boolean;
  wide?: boolean;
  fluid?: boolean;
  colors: any;
  styles: TableStyles;
  onPress: () => void;
}) {
  const highlighted = selected || open;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterBtn,
        wide && styles.filterBtnWide,
        fluid && styles.filterBtnFluid,
        selected && styles.filterBtnSelected,
        open && styles.filterBtnOpen,
        disabled && styles.disabled,
        { opacity: pressed ? 0.82 : 1 },
      ]}
    >
      <View style={styles.filterBtnTextBox}>
        <ThemedText
          numberOfLines={1}
          style={[
            styles.filterLabel,
            selected && styles.filterLabelSelected,
            open && styles.filterLabelOpen,
          ]}
        >
          {label}
        </ThemedText>

        <ThemedText
          numberOfLines={1}
          style={[
            styles.filterValue,
            selected && styles.filterValueSelected,
            open && styles.filterValueOpen,
          ]}
        >
          {value}
        </ThemedText>
      </View>

      <View
        style={[
          styles.filterChevron,
          highlighted && styles.filterChevronHighlighted,
          open && styles.filterChevronOpen,
        ]}
      >
        <Ionicons
          name={open ? "chevron-up-outline" : "chevron-down-outline"}
          size={16}
          color={
            open
              ? colors.primaryForeground || "#FFFFFF"
              : highlighted
                ? colors.primary
                : colors.textSecondary
          }
        />
      </View>
    </Pressable>
  );
}

function DropdownPanel({
  title,
  empty,
  options,
  selectedValue,
  colors,
  styles,
  onClose,
  onSelect,
}: {
  title: string;
  empty: string;
  options: { label: string; value: string }[];
  selectedValue: string;
  colors: any;
  styles: TableStyles;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const primaryForeground = colors.primaryForeground || "#FFFFFF";

  return (
    <View style={styles.dropdownPanel}>
      <View style={styles.dropdownTitleRow}>
        <ThemedText style={styles.dropdownTitle}>{title}</ThemedText>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons
            name="close-outline"
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      <View style={styles.dropdownOptions}>
        {options.length === 0 ? (
          <View style={styles.dropdownOption}>
            <ThemedText style={styles.dropdownOptionText}>{empty}</ThemedText>
          </View>
        ) : (
          options.map((option) => {
            const active = selectedValue === option.value;

            return (
              <Pressable
                key={`${option.value}-${option.label}`}
                onPress={() => onSelect(option.value)}
                style={[
                  styles.dropdownOption,
                  active && styles.dropdownOptionActive,
                ]}
              >
                {active && (
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={15}
                    color={primaryForeground}
                  />
                )}
                <ThemedText
                  style={[
                    styles.dropdownOptionText,
                    active && styles.dropdownOptionTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

function EstudianteResumen({
  estudiante,
  nombre,
  colors,
  styles,
  compacto = false,
}: {
  estudiante: EstudianteUsuario;
  nombre: string;
  colors: any;
  styles: TableStyles;
  compacto?: boolean;
}) {
  return (
    <View style={styles.usuarioResumen}>
      <View style={styles.multimediaBox}>
        {estudiante.fotoUrl ? (
          <Image source={{ uri: estudiante.fotoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarEmpty}>
            <ThemedText style={styles.avatarLetters}>
              {obtenerIniciales(estudiante)}
            </ThemedText>
          </View>
        )}

        {estudiante.qrUrl ? (
          <Image source={{ uri: estudiante.qrUrl }} style={styles.qrMini} />
        ) : (
          <View style={styles.qrMiniEmpty}>
            <Ionicons
              name="qr-code-outline"
              size={14}
              color={colors.textMuted || colors.textSecondary}
            />
          </View>
        )}
      </View>

      <View style={styles.usuarioInfo}>
        <ThemedText numberOfLines={1} style={styles.nombreText}>
          {nombre || "Sin nombre"}
        </ThemedText>
        <ThemedText numberOfLines={1} style={styles.usuarioText}>
          @{estudiante.usuario || "sin_usuario"}
        </ThemedText>
        {compacto && (
          <ThemedText numberOfLines={1} style={styles.compactCiText}>
            CI: {estudiante.ci || "—"}{" "}
            {estudiante.expedido ? `· ${estudiante.expedido}` : ""}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

function EstadoBadge({
  estado,
  activo,
  styles,
}: {
  estado?: string | null;
  activo: boolean;
  styles: TableStyles;
}) {
  return (
    <View
      style={[
        styles.badge,
        activo ? styles.badgeActive : styles.badgeInactive,
      ]}
    >
      <ThemedText style={styles.badgeText}>
        {normalizarEstado(estado)}
      </ThemedText>
    </View>
  );
}

function ActionButtons({
  colors,
  compact = false,
  onVer,
  onHistorial,
}: {
  colors: any;
  compact?: boolean;
  onVer: () => void;
  onHistorial: () => void;
}) {
  const width = compact ? 104 : 124;
  const height = compact ? 34 : 38;

  return (
    <View style={{ width, alignItems: "stretch", gap: 8 }}>
      <ActionColumnButton
        icon="eye-outline"
        label="Ver"
        width={width}
        height={height}
        backgroundColor={colors.primary || "#EF4444"}
        textColor={colors.primaryForeground || "#FFFFFF"}
        onPress={onVer}
      />
      <ActionColumnButton
        icon="school-outline"
        label="Historial"
        width={width}
        height={height}
        backgroundColor={
          colors.cardSecondary ||
          colors.surface ||
          "rgba(148, 163, 184, 0.12)"
        }
        textColor={colors.text || "#FFFFFF"}
        borderColor={colors.border || "rgba(148, 163, 184, 0.35)"}
        onPress={onHistorial}
      />
    </View>
  );
}

function ActionColumnButton({
  icon,
  label,
  width,
  height,
  backgroundColor,
  textColor,
  borderColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width,
        height,
        borderRadius: 14,
        borderWidth: borderColor ? 1 : 0,
        borderColor,
        backgroundColor,
        opacity: pressed ? 0.75 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        paddingHorizontal: 10,
      })}
    >
      <Ionicons name={icon} size={15} color={textColor} />
      <ThemedText
        numberOfLines={1}
        style={{ color: textColor, fontSize: 11, fontWeight: "900" }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function MobileEstudianteCard({
  estudiante,
  nombre,
  referencia,
  cantidadDocs,
  estadoActivo,
  matricula,
  fechaInscripcion,
  promocion,
  tipoTexto,
  carreraTexto,
  nivelTexto,
  colors,
  styles,
  onVer,
  onHistorial,
}: {
  estudiante: EstudianteUsuario;
  nombre: string;
  referencia: any;
  cantidadDocs: number;
  estadoActivo: boolean;
  matricula: string;
  fechaInscripcion: string;
  promocion: string;
  tipoTexto: string;
  carreraTexto: string;
  nivelTexto: string;
  colors: any;
  styles: TableStyles;
  onVer: () => void;
  onHistorial: () => void;
}) {
  return (
    <View style={styles.mobileCard}>
      <View style={styles.mobileCardTop}>
        <EstudianteResumen
          estudiante={estudiante}
          nombre={nombre}
          colors={colors}
          styles={styles}
        />
        <EstadoBadge
          estado={estudiante.estado}
          activo={estadoActivo}
          styles={styles}
        />
      </View>

      <View style={styles.mobileDivider} />

      <View style={styles.mobileInfoGrid}>
        <MobileInfo label="Matrícula" value={matricula} styles={styles} />
        <MobileInfo
          label="Inscripción"
          value={fechaInscripcion}
          styles={styles}
        />
        <MobileInfo label="Tipo" value={tipoTexto} styles={styles} />
        <MobileInfo label="Carrera" value={carreraTexto} styles={styles} />
        <MobileInfo label="Nivel" value={nivelTexto} styles={styles} />
        <MobileInfo
          label="Correo"
          value={estudiante.email || "Sin correo"}
          styles={styles}
        />
        <MobileInfo
          label="Celular"
          value={estudiante.celular || "Sin celular"}
          styles={styles}
        />
        <MobileInfo
          label="Referencia"
          value={
            referencia?.nombreContactoReferencia
              ? `${referencia.nombreContactoReferencia}${
                  referencia.numeroReferencia
                    ? ` · ${referencia.numeroReferencia}`
                    : ""
                }`
              : "Sin referencia"
          }
          styles={styles}
        />
        <MobileInfo
          label="Documentos"
          value={`${cantidadDocs} documento(s)`}
          styles={styles}
        />
        <MobileInfo
          label="Promoción"
          value={promocion || "Sin promoción"}
          styles={styles}
        />
      </View>

      <View style={{ gap: 8, marginTop: 10 }}>
        <MobileActionButton
          icon="eye-outline"
          label="Ver estudiante"
          backgroundColor={colors.primary || "#EF4444"}
          textColor={colors.primaryForeground || "#FFFFFF"}
          onPress={onVer}
        />
        <MobileActionButton
          icon="school-outline"
          label="Historial estudiante"
          backgroundColor={
            colors.cardSecondary ||
            colors.surface ||
            "rgba(148, 163, 184, 0.12)"
          }
          textColor={colors.text || "#FFFFFF"}
          borderColor={colors.border || "rgba(148, 163, 184, 0.35)"}
          onPress={onHistorial}
        />
      </View>
    </View>
  );
}

function MobileActionButton({
  icon,
  label,
  backgroundColor,
  textColor,
  borderColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "100%",
        height: 44,
        borderRadius: 16,
        borderWidth: borderColor ? 1 : 0,
        borderColor,
        backgroundColor,
        opacity: pressed ? 0.75 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingHorizontal: 12,
      })}
    >
      <Ionicons name={icon} size={17} color={textColor} />
      <ThemedText
        numberOfLines={1}
        style={{ color: textColor, fontSize: 12, fontWeight: "900" }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function MobileInfo({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: TableStyles;
}) {
  return (
    <View style={styles.mobileInfoItem}>
      <ThemedText style={styles.mobileInfoLabel}>{label}</ThemedText>
      <ThemedText numberOfLines={2} style={styles.mobileInfoValue}>
        {value}
      </ThemedText>
    </View>
  );
}