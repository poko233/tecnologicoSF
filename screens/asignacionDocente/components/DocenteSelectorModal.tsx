import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import { Docente } from "../types/asignacionDocente.types";

const DOCENTES_POR_PAGINA = 8;

type Props = {
  visible: boolean;
  docentes: Docente[];
  idDocenteSeleccionado: number | null;
  onClose: () => void;
  onSelect: (docente: Docente) => void;
};

function normalizarTexto(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getNombreCompleto(docente: Docente) {
  const usuario = docente.usuario;

  const nombre = [
    usuario?.nombres ?? "",
    usuario?.apellidoPaterno ?? "",
    usuario?.apellidoMaterno ?? "",
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return nombre || `Docente ${docente.idDocente}`;
}

function getTituloProfesional(docente: Docente) {
  const abreviatura =
    docente.abreviaturaProfesional ?? docente.abreviaturaProfesion ?? "";

  const profesion = docente.profesion ?? "Sin profesión";

  return abreviatura ? `${abreviatura}. ${profesion}` : profesion;
}

export default function DocenteSelectorModal({
  visible,
  docentes,
  idDocenteSeleccionado,
  onClose,
  onSelect,
}: Props) {
  const { theme } = useTheme();

  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    if (visible) {
      setBusqueda("");
      setPaginaActual(1);
    }
  }, [visible]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const docentesActivosFiltrados = useMemo(() => {
    const termino = normalizarTexto(busqueda);

    return docentes
      .filter(
        (docente) =>
          normalizarTexto(docente.estadoDocente) === "activo",
      )
      .filter((docente) => {
        if (!termino) return true;

        const textoBusqueda = normalizarTexto(
          [
            getNombreCompleto(docente),
            docente.usuario?.nombres,
            docente.usuario?.apellidoPaterno,
            docente.usuario?.apellidoMaterno,
            docente.usuario?.ci,
            docente.profesion,
            docente.abreviaturaProfesional,
            docente.abreviaturaProfesion,
          ].join(" "),
        );

        return textoBusqueda.includes(termino);
      })
      .sort((a, b) =>
        getNombreCompleto(a).localeCompare(getNombreCompleto(b), "es", {
          sensitivity: "base",
        }),
      );
  }, [docentes, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(docentesActivosFiltrados.length / DOCENTES_POR_PAGINA),
  );

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * DOCENTES_POR_PAGINA;
  const indiceFin = indiceInicio + DOCENTES_POR_PAGINA;

  const docentesPagina = docentesActivosFiltrados.slice(
    indiceInicio,
    indiceFin,
  );

  const paginasVisibles = useMemo(() => {
    const paginas: number[] = [];

    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(totalPaginas, paginaActual + 2);

    for (let pagina = inicio; pagina <= fin; pagina += 1) {
      paginas.push(pagina);
    }

    return paginas;
  }, [paginaActual, totalPaginas]);

  const cambiarPagina = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas) return;

    setPaginaActual(pagina);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          { backgroundColor: theme.colors.overlay },
        ]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.modal,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <ThemedText
                style={[
                  styles.title,
                  { color: theme.colors.text },
                ]}
              >
                Seleccionar docente
              </ThemedText>

              <ThemedText
                style={[
                  styles.subtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Solo aparecen docentes activos disponibles para asignación.
              </ThemedText>
            </View>

            <Pressable
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.input,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: theme.colors.input,
                borderColor: theme.colors.inputBorder,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.textSecondary}
            />

            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar por nombre, CI o profesión..."
              placeholderTextColor={theme.colors.textTertiary}
              style={[
                styles.searchInput,
                { color: theme.colors.text },
              ]}
            />

            {busqueda.length > 0 && (
              <Pressable
                onPress={() => setBusqueda("")}
                hitSlop={8}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.textTertiary}
                />
              </Pressable>
            )}
          </View>

          <View style={styles.resultsInfo}>
            <ThemedText
              style={[
                styles.resultsText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {docentesActivosFiltrados.length === 0
                ? "No se encontraron docentes."
                : `${docentesActivosFiltrados.length} docente(s) encontrado(s)`}
            </ThemedText>

            {docentesActivosFiltrados.length > 0 && (
              <ThemedText
                style={[
                  styles.resultsText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Mostrando {indiceInicio + 1}-
                {Math.min(indiceFin, docentesActivosFiltrados.length)}
              </ThemedText>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator
            persistentScrollbar
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {docentesPagina.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="people-outline"
                  size={46}
                  color={theme.colors.textTertiary}
                />

                <ThemedText
                  style={[
                    styles.emptyTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  No hay docentes disponibles
                </ThemedText>

                <ThemedText
                  style={[
                    styles.emptyText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  No se encontraron docentes activos con los datos buscados.
                </ThemedText>
              </View>
            ) : (
              docentesPagina.map((docente) => {
                const active =
                  docente.idDocente === idDocenteSeleccionado;

                return (
                  <Pressable
                    key={docente.idDocente}
                    onPress={() => onSelect(docente)}
                    style={[
                      styles.item,
                      {
                        backgroundColor: active
                          ? theme.colors.primarySubtle
                          : theme.colors.input,
                        borderColor: active
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor: active
                            ? theme.colors.primary
                            : theme.colors.primarySubtle,
                        },
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={22}
                        color={
                          active
                            ? theme.colors.primaryForeground
                            : theme.colors.primary
                        }
                      />
                    </View>

                    <View style={styles.docenteInfo}>
                      <ThemedText
                        numberOfLines={1}
                        style={[
                          styles.name,
                          { color: theme.colors.text },
                        ]}
                      >
                        {getNombreCompleto(docente)}
                      </ThemedText>

                      <ThemedText
                        numberOfLines={1}
                        style={[
                          styles.profession,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {getTituloProfesional(docente)}
                      </ThemedText>

                      <ThemedText
                        numberOfLines={1}
                        style={[
                          styles.meta,
                          { color: theme.colors.textTertiary },
                        ]}
                      >
                        CI: {docente.usuario?.ci ?? "-"} · Estado:{" "}
                        {docente.estadoDocente ?? "-"}
                      </ThemedText>
                    </View>

                    {active && (
                      <Ionicons
                        name="checkmark-circle"
                        size={27}
                        color={theme.colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {docentesActivosFiltrados.length > 0 && (
            <View style={styles.pagination}>
              <Pressable
                disabled={paginaActual === 1}
                onPress={() => cambiarPagina(paginaActual - 1)}
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor:
                      paginaActual === 1
                        ? theme.colors.input
                        : theme.colors.background,
                    borderColor: theme.colors.border,
                    opacity: paginaActual === 1 ? 0.45 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={theme.colors.text}
                />

                <ThemedText
                  style={[
                    styles.paginationButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  Anterior
                </ThemedText>
              </Pressable>

              <View style={styles.pageNumbers}>
                {paginaActual > 3 && (
                  <>
                    <Pressable
                      onPress={() => cambiarPagina(1)}
                      style={[
                        styles.pageButton,
                        {
                          backgroundColor: theme.colors.input,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.pageText,
                          { color: theme.colors.text },
                        ]}
                      >
                        1
                      </ThemedText>
                    </Pressable>

                    <ThemedText
                      style={[
                        styles.dots,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      ...
                    </ThemedText>
                  </>
                )}

                {paginasVisibles.map((pagina) => {
                  const esPaginaActual = pagina === paginaActual;

                  return (
                    <Pressable
                      key={pagina}
                      onPress={() => cambiarPagina(pagina)}
                      style={[
                        styles.pageButton,
                        {
                          backgroundColor: esPaginaActual
                            ? theme.colors.primary
                            : theme.colors.input,
                          borderColor: esPaginaActual
                            ? theme.colors.primary
                            : theme.colors.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.pageText,
                          {
                            color: esPaginaActual
                              ? theme.colors.primaryForeground
                              : theme.colors.text,
                          },
                        ]}
                      >
                        {pagina}
                      </ThemedText>
                    </Pressable>
                  );
                })}

                {paginaActual < totalPaginas - 2 && (
                  <>
                    <ThemedText
                      style={[
                        styles.dots,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      ...
                    </ThemedText>

                    <Pressable
                      onPress={() => cambiarPagina(totalPaginas)}
                      style={[
                        styles.pageButton,
                        {
                          backgroundColor: theme.colors.input,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.pageText,
                          { color: theme.colors.text },
                        ]}
                      >
                        {totalPaginas}
                      </ThemedText>
                    </Pressable>
                  </>
                )}
              </View>

              <Pressable
                disabled={paginaActual === totalPaginas}
                onPress={() => cambiarPagina(paginaActual + 1)}
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor:
                      paginaActual === totalPaginas
                        ? theme.colors.input
                        : theme.colors.background,
                    borderColor: theme.colors.border,
                    opacity:
                      paginaActual === totalPaginas ? 0.45 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.paginationButtonText,
                    { color: theme.colors.text },
                  ]}
                >
                  Siguiente
                </ThemedText>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.colors.text}
                />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: 720,
    maxHeight: "88%",
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 14,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },

  header: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
  },

  subtitle: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },

  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    borderWidth: 1,
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    outlineStyle: "none" as any,
  },

  clearButton: {
    alignItems: "center",
    justifyContent: "center",
  },

  resultsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  resultsText: {
    fontSize: 12,
    fontWeight: "700",
  },

  list: {
    flexGrow: 0,
  },

  listContent: {
    paddingBottom: 2,
  },

  item: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  docenteInfo: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontSize: 16,
    fontWeight: "900",
  },

  profession: {
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3,
  },

  meta: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },

  empty: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
  },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 2,
  },

  paginationButton: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  paginationButtonText: {
    fontSize: 12,
    fontWeight: "900",
  },

  pageNumbers: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flex: 1,
  },

  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  pageText: {
    fontSize: 12,
    fontWeight: "900",
  },

  dots: {
    fontSize: 14,
    fontWeight: "900",
    marginHorizontal: 1,
  },
});