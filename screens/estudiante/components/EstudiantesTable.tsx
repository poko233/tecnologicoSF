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
    obtenerRoles,
    obtenerTipoCarreraLabel,
    obtenerTiposCarreraEstudiante,
    obtenerTiposCarreraTexto,
} from "../utils/estudiante.helpers";

type FiltrosEstudiantes = {
  tipo: string;
  idCarrera: string;
  nivel: string;
};

type Props = {
  estudiantes: EstudianteUsuario[];
  loading: boolean;
  filtros: FiltrosEstudiantes;
  onFiltrosChange: (filtros: FiltrosEstudiantes) => void;
  onVerDetalle: (estudiante: EstudianteUsuario) => void;
  onRefresh: () => void;
};

type FilterKey = "tipo" | "carrera" | "nivel";
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
  onFiltrosChange,
  onVerDetalle,
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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);

  const filtroTipo = filtros.tipo;
  const filtroCarrera = filtros.idCarrera;
  const filtroNivel = filtros.nivel;

  const setFiltroTipo = (tipo: string) => {
    onFiltrosChange({
      tipo,
      idCarrera: "",
      nivel: "",
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

  const tipoOptions = useMemo(() => {
    return ["CARRERA", "CURSO"];
  }, []);

  const carreraOptions = useMemo(() => {
    const carreras = estudiantes.flatMap((estudiante) =>
      obtenerCarrerasEstudiante(estudiante),
    );

    const carrerasFiltradas = filtroTipo
      ? carreras.filter(
          (carrera: CarreraFiltro) =>
            normalizarTipoCarrera(carrera.tipo) === filtroTipo,
        )
      : carreras;

    return uniqueCarreras(carrerasFiltradas);
  }, [estudiantes, filtroTipo]);

  const carreraSeleccionada = useMemo(() => {
    return carreraOptions.find(
      (carrera) => carrera.idCarrera === filtroCarrera,
    );
  }, [carreraOptions, filtroCarrera]);

  const labelNivel = obtenerLabelNivelPorRegimen(
    carreraSeleccionada?.regimen,
  );

  const nivelOptions = useMemo(() => {
    if (!filtroCarrera) return [];

    return uniqueSorted(
      estudiantes
        .filter((estudiante) =>
          obtenerCarrerasEstudiante(estudiante).some(
            (carrera: CarreraFiltro) => carrera.idCarrera === filtroCarrera,
          ),
        )
        .flatMap((estudiante) =>
          obtenerNivelesDeCarreraEstudiante(estudiante, filtroCarrera),
        ),
    );
  }, [estudiantes, filtroCarrera]);

  const hayFiltrosActivos = !!filtroTipo || !!filtroCarrera || !!filtroNivel;

  const data = useMemo(() => {
    const query = search.trim().toLowerCase();

    return estudiantes.filter((estudiante) => {
      const referencia = obtenerReferencia(estudiante);
      const promocion = obtenerPromocionActual(estudiante);
      const matricula = obtenerMatricula(estudiante);
      const fechaInscripcion = obtenerFechaInscripcion(estudiante);
      const carreras = obtenerCarrerasEstudiante(estudiante);
      const tipos = obtenerTiposCarreraEstudiante(estudiante);

      const niveles = obtenerNivelesDeCarreraEstudiante(
        estudiante,
        filtroCarrera,
      );

      const cumpleTipo = !filtroTipo || tipos.includes(filtroTipo);

      const cumpleCarrera =
        !filtroCarrera ||
        carreras.some(
          (carrera: CarreraFiltro) => carrera.idCarrera === filtroCarrera,
        );

      const cumpleNivel = !filtroNivel || niveles.includes(filtroNivel);

      if (!cumpleTipo || !cumpleCarrera || !cumpleNivel) {
        return false;
      }

      if (!query) return true;

      return [
        estudiante.usuario,
        estudiante.ci,
        estudiante.nombres,
        estudiante.apellidoPaterno,
        estudiante.apellidoMaterno || "",
        estudiante.email || "",
        estudiante.celular || "",
        estudiante.estado,
        estudiante.expedido || "",
        promocion,
        matricula,
        fechaInscripcion,
        obtenerRoles(estudiante),
        obtenerTiposCarreraTexto(estudiante),
        obtenerCarrerasTexto(estudiante),
        obtenerNivelesTexto(estudiante),
        referencia?.nombreContactoReferencia || "",
        referencia?.parentesco || "",
        referencia?.numeroReferencia || "",
        String(estudiante.documentos?.length ?? 0),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [estudiantes, search, filtroTipo, filtroCarrera, filtroNivel]);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [search, filtroTipo, filtroCarrera, filtroNivel]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!filtroTipo || !filtroCarrera) return;

    const carreraExisteEnTipo = carreraOptions.some(
      (carrera) => carrera.idCarrera === filtroCarrera,
    );

    if (!carreraExisteEnTipo) {
      onFiltrosChange({
        tipo: filtroTipo,
        idCarrera: "",
        nivel: "",
      });
    }
  }, [filtroTipo, filtroCarrera, carreraOptions, onFiltrosChange]);

  const limpiarBusqueda = () => {
    setSearch("");
    setPage(1);
  };

  const limpiarFiltros = () => {
    onFiltrosChange({
      tipo: "",
      idCarrera: "",
      nivel: "",
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
            {
              label: "Todos",
              value: "",
            },
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
            {
              label: "Todas",
              value: "",
            },
            ...carreraOptions.map((carrera) => ({
              label: `${carrera.nombreCarrera}${
                carrera.regimen ? ` · ${carrera.regimen}` : ""
              }${
                carrera.tipo
                  ? ` · ${obtenerTipoCarreraLabel(carrera.tipo)}`
                  : ""
              }`,
              value: carrera.idCarrera,
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

    return (
      <DropdownPanel
        title={`Filtrar por ${labelNivel.toLowerCase()}`}
        empty={`No hay ${labelNivel.toLowerCase()}s registrados para esta carrera.`}
        options={[
          {
            label: `Todos los ${labelNivel.toLowerCase()}s`,
            value: "",
          },
          ...nivelOptions.map((nivel) => ({
            label: nivel,
            value: nivel,
          })),
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
  };

  return (
    <View style={styles.card}>
      <View style={[styles.top, isMobile && styles.topMobile]}>
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

        <View style={styles.filterBar}>
          <FilterButton
            label="Tipo"
            value={filtroTipo ? obtenerTipoCarreraLabel(filtroTipo) : "Todos"}
            active={activeFilter === "tipo" || !!filtroTipo}
            colors={colors}
            styles={styles}
            onPress={() =>
              setActiveFilter((current) =>
                current === "tipo" ? null : "tipo",
              )
            }
          />

          <FilterButton
            label="Carrera"
            value={carreraSeleccionada?.nombreCarrera || "Todas"}
            active={activeFilter === "carrera" || !!filtroCarrera}
            colors={colors}
            styles={styles}
            onPress={() =>
              setActiveFilter((current) =>
                current === "carrera" ? null : "carrera",
              )
            }
          />

          <FilterButton
            label={labelNivel}
            value={!filtroCarrera ? "Elige carrera" : filtroNivel || "Todos"}
            active={activeFilter === "nivel" || !!filtroNivel}
            disabled={!filtroCarrera}
            colors={colors}
            styles={styles}
            onPress={() => {
              if (!filtroCarrera) return;

              setActiveFilter((current) =>
                current === "nivel" ? null : "nivel",
              );
            }}
          />

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

              {!isMobile && (
                <ThemedText style={styles.filterClearText}>
                  Limpiar
                </ThemedText>
              )}
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

            {!isMobile && (
              <ThemedText style={styles.refreshText}>Actualizar</ThemedText>
            )}
          </Pressable>
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
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre, CI, matrícula, tipo, carrera, nivel, correo, celular, referencia, estado o promoción..."
          placeholderTextColor={colors.textMuted || colors.textSecondary}
          style={styles.searchInput}
        />

        {!!search && (
          <Pressable
            onPress={limpiarBusqueda}
            hitSlop={8}
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
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
            Prueba con otro tipo, carrera, {labelNivel.toLowerCase()}, nombre,
            CI, matrícula, correo, celular, referencia, promoción o estado.
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
                    <ThemedText
                      style={[styles.headerText, styles.headerUsuario]}
                    >
                      Estudiante
                    </ThemedText>

                    <ThemedText
                      style={[styles.headerText, styles.headerContacto]}
                    >
                      Contacto
                    </ThemedText>

                    <ThemedText
                      style={[styles.headerText, styles.headerAcademico]}
                    >
                      Académico
                    </ThemedText>

                    <ThemedText
                      style={[styles.headerText, styles.headerReferencia]}
                    >
                      Referencia y promoción
                    </ThemedText>

                    <ThemedText
                      style={[styles.headerText, styles.headerEstado]}
                    >
                      Estado
                    </ThemedText>

                    <ThemedText
                      style={[styles.headerText, styles.headerAccion]}
                    >
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
                          <ThemedText
                            numberOfLines={1}
                            style={styles.compactPrimary}
                          >
                            Matrícula: {matricula}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.compactSecondary}
                          >
                            Tipo: {tipoTexto}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.compactSecondary}
                          >
                            Carrera: {carreraTexto}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.compactSecondary}
                          >
                            Nivel: {nivelTexto}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.observacionCompact}
                          >
                            Promo: {promocion || "Sin promoción"} · Docs:{" "}
                            {cantidadDocs}
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
                          <VerButton
                            compact
                            colors={colors}
                            styles={styles}
                            onPress={() => onVerDetalle(estudiante)}
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
                          <ThemedText
                            numberOfLines={1}
                            style={styles.contactPrimary}
                          >
                            {estudiante.email || "Sin correo"}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.contactSecondary}
                          >
                            {estudiante.celular || "Sin celular"}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.contactSecondary}
                          >
                            CI: {estudiante.ci || "—"}{" "}
                            {estudiante.expedido
                              ? `· ${estudiante.expedido}`
                              : ""}
                          </ThemedText>
                        </View>

                        <View style={styles.academicoCell}>
                          <ThemedText
                            numberOfLines={1}
                            style={styles.infoPrimary}
                          >
                            {matricula}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.infoSecondary}
                          >
                            Tipo: {tipoTexto}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.infoSecondary}
                          >
                            Carrera: {carreraTexto}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.infoSecondary}
                          >
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
                          <ThemedText
                            numberOfLines={1}
                            style={styles.referenciaText}
                          >
                            {referencia?.nombreContactoReferencia
                              ? `${referencia.nombreContactoReferencia}${
                                  referencia.parentesco
                                    ? ` · ${referencia.parentesco}`
                                    : ""
                                }`
                              : "Sin referencia"}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.observacionText}
                          >
                            {referencia?.numeroReferencia
                              ? `Cel: ${referencia.numeroReferencia}`
                              : "Sin número de referencia"}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.observacionText}
                          >
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
                          <VerButton
                            colors={colors}
                            styles={styles}
                            onPress={() => onVerDetalle(estudiante)}
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
  active,
  disabled = false,
  colors,
  styles,
  onPress,
}: {
  label: string;
  value: string;
  active: boolean;
  disabled?: boolean;
  colors: any;
  styles: TableStyles;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterBtn,
        active && styles.filterBtnActive,
        disabled && styles.disabled,
        { opacity: pressed ? 0.78 : 1 },
      ]}
    >
      <View style={styles.filterBtnTextBox}>
        <ThemedText
          numberOfLines={1}
          style={[styles.filterLabel, active && styles.filterLabelActive]}
        >
          {label}
        </ThemedText>

        <ThemedText
          numberOfLines={1}
          style={[styles.filterValue, active && styles.filterValueActive]}
        >
          {value}
        </ThemedText>
      </View>

      <Ionicons
        name="chevron-down-outline"
        size={17}
        color={active ? colors.primaryForeground || "#FFFFFF" : colors.text}
      />
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
            <ThemedText style={styles.dropdownOptionText}>
              {empty}
            </ThemedText>
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

function VerButton({
  colors,
  styles,
  compact = false,
  onPress,
}: {
  colors: any;
  styles: TableStyles;
  compact?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        compact ? styles.editBtnCompact : styles.editBtn,
        { opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Ionicons
        name="eye-outline"
        size={compact ? 18 : 16}
        color={colors.primaryForeground || "#FFFFFF"}
      />

      {!compact && <ThemedText style={styles.editText}>Ver</ThemedText>}
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

      <Pressable
        onPress={onVer}
        style={({ pressed }) => [
          styles.mobileEditBtn,
          { opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <Ionicons
          name="eye-outline"
          size={17}
          color={colors.primaryForeground || "#FFFFFF"}
        />

        <ThemedText style={styles.editText}>Ver estudiante</ThemedText>
      </Pressable>
    </View>
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