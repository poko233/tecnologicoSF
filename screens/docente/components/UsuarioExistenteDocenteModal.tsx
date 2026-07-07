import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../contexts/ThemeContext";
import {
    AsignarUsuarioExistentePayload,
    PaginacionUsuarios,
    UsuarioDisponibleDocente,
} from "../types/docente.types";

type Props = {
  visible: boolean;
  isMobile: boolean;
  usuarios: UsuarioDisponibleDocente[];
  paginacion: PaginacionUsuarios;
  loadingUsuarios: boolean;
  saving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onClearError: () => void;
  onBuscarUsuarios: (
    buscar: string,
    pagina: number,
  ) => Promise<void>;
  onAsignarUsuario: (
    payload: AsignarUsuarioExistentePayload,
  ) => Promise<boolean>;
};

function getNombreCompleto(usuario: UsuarioDisponibleDocente) {
  const apellidos = [
    usuario.apellidoPaterno ?? "",
    usuario.apellidoMaterno ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const nombres = usuario.nombres ?? "";

  if (apellidos && nombres) {
    return `${apellidos}, ${nombres}`;
  }

  return apellidos || nombres || `Usuario ${usuario.id}`;
}

function getRolesUsuario(usuario: UsuarioDisponibleDocente) {
  const roles = usuario.roles ?? [];

  if (roles.length === 0) {
    return "Sin rol";
  }

  return roles
    .map((rol) => rol.rol)
    .filter(Boolean)
    .join(", ");
}

export default function UsuarioExistenteDocenteModal({
  visible,
  isMobile,
  usuarios,
  paginacion,
  loadingUsuarios,
  saving,
  errorMessage,
  onClose,
  onClearError,
  onBuscarUsuarios,
  onAsignarUsuario,
}: Props) {
  const { theme } = useTheme();

  const listaUsuariosRef = useRef<ScrollView | null>(null);

  /*
   * Se guardan las funciones en referencias para que el efecto de búsqueda
   * no se ejecute nuevamente por cambios de render del componente padre.
   */
  const buscarUsuariosRef = useRef(onBuscarUsuarios);
  const limpiarErrorRef = useRef(onClearError);

  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [listoParaBuscar, setListoParaBuscar] = useState(false);

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<UsuarioDisponibleDocente | null>(null);

  const [profesion, setProfesion] = useState("");
  const [abreviaturaProfesional, setAbreviaturaProfesional] =
    useState("");

  const [errores, setErrores] = useState<{
    usuario?: string;
    profesion?: string;
  }>({});

  useEffect(() => {
    buscarUsuariosRef.current = onBuscarUsuarios;
  }, [onBuscarUsuarios]);

  useEffect(() => {
    limpiarErrorRef.current = onClearError;
  }, [onClearError]);

  /*
   * Reinicia el modal solo al abrirlo o cerrarlo.
   * El estado listoParaBuscar evita que se hagan consultas repetidas
   * mientras el modal termina de inicializarse.
   */
  useEffect(() => {
    if (!visible) {
      setListoParaBuscar(false);
      setBusqueda("");
      setBusquedaAplicada("");
      setPaginaActual(1);
      setUsuarioSeleccionado(null);
      setProfesion("");
      setAbreviaturaProfesional("");
      setErrores({});
      return;
    }

    setBusqueda("");
    setBusquedaAplicada("");
    setPaginaActual(1);
    setUsuarioSeleccionado(null);
    setProfesion("");
    setAbreviaturaProfesional("");
    setErrores({});

    limpiarErrorRef.current();

    setListoParaBuscar(true);
  }, [visible]);

  /*
   * Espera 500 ms después de escribir antes de consultar al backend.
   * Mientras sigas escribiendo, el temporizador anterior se cancela.
   */
  useEffect(() => {
    if (!visible || !listoParaBuscar) {
      return;
    }

    if (busqueda === busquedaAplicada) {
      return;
    }

    const timeout = setTimeout(() => {
      setBusquedaAplicada(busqueda);
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    visible,
    listoParaBuscar,
    busqueda,
    busquedaAplicada,
  ]);

  /*
   * Consulta al backend una sola vez cuando cambia:
   * - La búsqueda ya confirmada luego del debounce.
   * - La página seleccionada.
   */
  useEffect(() => {
    if (!visible || !listoParaBuscar) {
      return;
    }

    void buscarUsuariosRef.current(
      busquedaAplicada.trim(),
      paginaActual,
    );
  }, [
    visible,
    listoParaBuscar,
    busquedaAplicada,
    paginaActual,
  ]);

  /*
   * Al cambiar página o resultados, vuelve al inicio de la lista.
   */
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timeout = setTimeout(() => {
      listaUsuariosRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [
    visible,
    paginaActual,
    usuarios.length,
  ]);

  const paginasVisibles = useMemo(() => {
    const paginas: number[] = [];

    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(
      paginacion.ultimaPagina,
      paginaActual + 2,
    );

    for (let pagina = inicio; pagina <= fin; pagina += 1) {
      paginas.push(pagina);
    }

    return paginas;
  }, [
    paginaActual,
    paginacion.ultimaPagina,
  ]);

  const cerrar = () => {
    if (saving) {
      return;
    }

    limpiarErrorRef.current();
    onClose();
  };

  const manejarBusqueda = (valor: string) => {
    setBusqueda(valor);

    if (paginaActual !== 1) {
      setPaginaActual(1);
    }

    setUsuarioSeleccionado(null);

    setErrores((prev) => ({
      ...prev,
      usuario: undefined,
    }));

    limpiarErrorRef.current();
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
    setBusquedaAplicada("");

    if (paginaActual !== 1) {
      setPaginaActual(1);
    }

    setUsuarioSeleccionado(null);

    setErrores((prev) => ({
      ...prev,
      usuario: undefined,
    }));

    limpiarErrorRef.current();
  };

  const cambiarPagina = (pagina: number) => {
    if (
      loadingUsuarios ||
      pagina < 1 ||
      pagina > paginacion.ultimaPagina ||
      pagina === paginaActual
    ) {
      return;
    }

    setPaginaActual(pagina);
    setUsuarioSeleccionado(null);

    listaUsuariosRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  };

  const seleccionarUsuario = (
    usuario: UsuarioDisponibleDocente,
  ) => {
    setUsuarioSeleccionado(usuario);

    setErrores((prev) => ({
      ...prev,
      usuario: undefined,
    }));

    limpiarErrorRef.current();
  };

  const guardar = async () => {
    const nuevosErrores: {
      usuario?: string;
      profesion?: string;
    } = {};

    if (!usuarioSeleccionado) {
      nuevosErrores.usuario =
        "Debes seleccionar un usuario existente.";
    }

    if (!profesion.trim()) {
      nuevosErrores.profesion =
        "La profesión del docente es obligatoria.";
    }

    setErrores(nuevosErrores);

    if (
      Object.keys(nuevosErrores).length > 0 ||
      !usuarioSeleccionado
    ) {
      return;
    }

    const correcto = await onAsignarUsuario({
      idUsuario: usuarioSeleccionado.id,
      profesion: profesion.trim(),
      abreviaturaProfesional:
        abreviaturaProfesional.trim() || null,
    });

    if (correcto) {
      cerrar();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cerrar}
    >
      <View
        style={[
          styles.overlay,
          { backgroundColor: theme.colors.overlay },
        ]}
      >
        <View
          style={[
            styles.modal,
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
                Usuario ya existente
              </ThemedText>

              <ThemedText
                style={[
                  styles.subtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Busca entre todos los usuarios activos, incluidos los
                estudiantes, que todavía no sean docentes.
              </ThemedText>
            </View>

            <Pressable
              disabled={saving}
              onPress={cerrar}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.input,
                  borderColor: theme.colors.border,
                  opacity: saving ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons
                name="close"
                size={23}
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
              editable={!saving}
              onChangeText={manejarBusqueda}
              placeholder="Buscar por apellido, nombre, CI o usuario..."
              placeholderTextColor={theme.colors.textTertiary}
              style={[
                styles.searchInput,
                { color: theme.colors.text },
              ]}
            />

            {busqueda.length > 0 && (
              <Pressable
                disabled={saving}
                onPress={limpiarBusqueda}
                hitSlop={8}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.textTertiary}
                />
              </Pressable>
            )}
          </View>

          {errorMessage && (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: theme.colors.destructive + "16",
                  borderColor: theme.colors.destructive,
                },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color={theme.colors.destructive}
              />

              <ThemedText
                style={[
                  styles.errorText,
                  { color: theme.colors.destructive },
                ]}
              >
                {errorMessage}
              </ThemedText>
            </View>
          )}

          {errores.usuario && (
            <ThemedText
              style={[
                styles.fieldError,
                { color: theme.colors.destructive },
              ]}
            >
              {errores.usuario}
            </ThemedText>
          )}

          <View style={styles.resultsInfo}>
            <ThemedText
              style={[
                styles.resultsText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {loadingUsuarios
                ? "Buscando usuarios..."
                : paginacion.total === 0
                  ? "No se encontraron usuarios."
                  : `${paginacion.total} usuario(s) encontrado(s)`}
            </ThemedText>

            {paginacion.total > 0 && (
              <ThemedText
                style={[
                  styles.resultsText,
                  styles.resultsTextRight,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Mostrando {paginacion.desde}-{paginacion.hasta}
              </ThemedText>
            )}
          </View>

          <ScrollView
            ref={listaUsuariosRef}
            style={styles.listaUsuarios}
            contentContainerStyle={styles.listaUsuariosContenido}
            showsVerticalScrollIndicator
            persistentScrollbar
          >
            {loadingUsuarios ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                />

                <ThemedText
                  style={[
                    styles.loadingText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Buscando usuarios...
                </ThemedText>
              </View>
            ) : usuarios.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="people-outline"
                  size={42}
                  color={theme.colors.textTertiary}
                />

                <ThemedText
                  style={[
                    styles.emptyTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  No se encontraron usuarios
                </ThemedText>

                <ThemedText
                  style={[
                    styles.emptyText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  No hay usuarios activos disponibles con esos datos.
                </ThemedText>
              </View>
            ) : (
              usuarios.map((usuario) => {
                const seleccionado =
                  usuarioSeleccionado?.id === usuario.id;

                return (
                  <Pressable
                    key={usuario.id}
                    disabled={saving}
                    onPress={() => seleccionarUsuario(usuario)}
                    style={[
                      styles.userItem,
                      {
                        backgroundColor: seleccionado
                          ? theme.colors.primarySubtle
                          : theme.colors.input,
                        borderColor: seleccionado
                          ? theme.colors.primary
                          : theme.colors.border,
                        opacity: saving ? 0.65 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.userIcon,
                        {
                          backgroundColor: seleccionado
                            ? theme.colors.primary
                            : theme.colors.primarySubtle,
                        },
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={22}
                        color={
                          seleccionado
                            ? theme.colors.primaryForeground
                            : theme.colors.primary
                        }
                      />
                    </View>

                    <View style={styles.userInfo}>
                      <ThemedText
                        numberOfLines={1}
                        style={[
                          styles.userName,
                          { color: theme.colors.text },
                        ]}
                      >
                        {getNombreCompleto(usuario)}
                      </ThemedText>

                      <ThemedText
                        numberOfLines={1}
                        style={[
                          styles.userMeta,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        CI: {usuario.ci} · Usuario: {usuario.usuario}
                      </ThemedText>

                      <ThemedText
                        numberOfLines={1}
                        style={[
                          styles.userMeta,
                          { color: theme.colors.textTertiary },
                        ]}
                      >
                        Roles: {getRolesUsuario(usuario)}
                      </ThemedText>

                      {!!usuario.email && (
                        <ThemedText
                          numberOfLines={1}
                          style={[
                            styles.userMeta,
                            { color: theme.colors.textTertiary },
                          ]}
                        >
                          {usuario.email}
                        </ThemedText>
                      )}
                    </View>

                    {seleccionado && (
                      <Ionicons
                        name="checkmark-circle"
                        size={26}
                        color={theme.colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {paginacion.total > 0 && (
            <View
              style={[
                styles.pagination,
                {
                  flexDirection: isMobile ? "column" : "row",
                },
              ]}
            >
              <Pressable
                disabled={loadingUsuarios || paginaActual <= 1}
                onPress={() => cambiarPagina(paginaActual - 1)}
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor:
                      paginaActual <= 1
                        ? theme.colors.input
                        : theme.colors.background,
                    borderColor: theme.colors.border,
                    opacity:
                      loadingUsuarios || paginaActual <= 1
                        ? 0.45
                        : 1,
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
                      disabled={loadingUsuarios}
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
                  const activa = pagina === paginaActual;

                  return (
                    <Pressable
                      key={pagina}
                      disabled={loadingUsuarios}
                      onPress={() => cambiarPagina(pagina)}
                      style={[
                        styles.pageButton,
                        {
                          backgroundColor: activa
                            ? theme.colors.primary
                            : theme.colors.input,
                          borderColor: activa
                            ? theme.colors.primary
                            : theme.colors.border,
                          opacity: loadingUsuarios ? 0.55 : 1,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.pageText,
                          {
                            color: activa
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

                {paginaActual < paginacion.ultimaPagina - 2 && (
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
                      disabled={loadingUsuarios}
                      onPress={() =>
                        cambiarPagina(paginacion.ultimaPagina)
                      }
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
                        {paginacion.ultimaPagina}
                      </ThemedText>
                    </Pressable>
                  </>
                )}
              </View>

              <Pressable
                disabled={
                  loadingUsuarios ||
                  paginaActual >= paginacion.ultimaPagina
                }
                onPress={() => cambiarPagina(paginaActual + 1)}
                style={[
                  styles.paginationButton,
                  {
                    backgroundColor:
                      paginaActual >= paginacion.ultimaPagina
                        ? theme.colors.input
                        : theme.colors.background,
                    borderColor: theme.colors.border,
                    opacity:
                      loadingUsuarios ||
                      paginaActual >= paginacion.ultimaPagina
                        ? 0.45
                        : 1,
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

          {usuarioSeleccionado && (
            <View
              style={[
                styles.selectedBox,
                {
                  backgroundColor: theme.colors.primarySubtle,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={theme.colors.primary}
              />

              <View style={styles.selectedInfo}>
                <ThemedText
                  style={[
                    styles.selectedLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Usuario seleccionado
                </ThemedText>

                <ThemedText
                  style={[
                    styles.selectedName,
                    { color: theme.colors.text },
                  ]}
                >
                  {getNombreCompleto(usuarioSeleccionado)}
                </ThemedText>
              </View>
            </View>
          )}

          <View
            style={[
              styles.fieldsRow,
              {
                flexDirection: isMobile ? "column" : "row",
              },
            ]}
          >
            <View style={styles.fieldColumn}>
              <ThemedText
                style={[
                  styles.label,
                  { color: theme.colors.text },
                ]}
              >
                Profesión *
              </ThemedText>

              <TextInput
                value={profesion}
                editable={!saving}
                onChangeText={(value) => {
                  setProfesion(value);

                  setErrores((prev) => ({
                    ...prev,
                    profesion: undefined,
                  }));
                }}
                placeholder="Ej: Ingeniero de Sistemas"
                placeholderTextColor={theme.colors.textTertiary}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.input,
                    borderColor: errores.profesion
                      ? theme.colors.destructive
                      : theme.colors.inputBorder,
                  },
                ]}
              />

              {errores.profesion && (
                <ThemedText
                  style={[
                    styles.fieldError,
                    { color: theme.colors.destructive },
                  ]}
                >
                  {errores.profesion}
                </ThemedText>
              )}
            </View>

            <View style={styles.fieldColumn}>
              <ThemedText
                style={[
                  styles.label,
                  { color: theme.colors.text },
                ]}
              >
                Abreviatura profesional
              </ThemedText>

              <TextInput
                value={abreviaturaProfesional}
                editable={!saving}
                onChangeText={setAbreviaturaProfesional}
                placeholder="Ej: Ing."
                placeholderTextColor={theme.colors.textTertiary}
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    backgroundColor: theme.colors.input,
                    borderColor: theme.colors.inputBorder,
                  },
                ]}
              />
            </View>
          </View>

          <View
            style={[
              styles.actions,
              {
                flexDirection: isMobile ? "column-reverse" : "row",
              },
            ]}
          >
            <Pressable
              disabled={saving}
              onPress={cerrar}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  opacity: saving ? 0.5 : 1,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.cancelText,
                  { color: theme.colors.text },
                ]}
              >
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              disabled={saving}
              onPress={guardar}
              style={[
                styles.saveButton,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: saving ? 0.65 : 1,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primaryForeground}
                />
              ) : (
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={theme.colors.primaryForeground}
                />
              )}

              <ThemedText
                style={[
                  styles.saveText,
                  { color: theme.colors.primaryForeground },
                ]}
              >
                {saving
                  ? "Asignando docente..."
                  : "Asignar como docente"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    width: "100%",
    maxWidth: 780,
    maxHeight: "94%",
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  closeButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
  },

  errorBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },

  fieldError: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "800",
  },

  resultsInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  resultsText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
  },

  resultsTextRight: {
    textAlign: "right",
  },

  listaUsuarios: {
    maxHeight: 280,
  },

  listaUsuariosContenido: {
    paddingBottom: 2,
  },

  loadingBox: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 13,
    fontWeight: "700",
  },

  userItem: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  userIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  userInfo: {
    flex: 1,
    minWidth: 0,
  },

  userName: {
    fontSize: 14,
    fontWeight: "900",
  },

  userMeta: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
  },

  empty: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
  },

  emptyText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "600",
  },

  pagination: {
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },

  paginationButton: {
    minHeight: 40,
    minWidth: 108,
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  pageButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 11,
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
  },

  selectedBox: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  selectedInfo: {
    flex: 1,
    minWidth: 0,
  },

  selectedLabel: {
    fontSize: 10,
    fontWeight: "800",
  },

  selectedName: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "900",
  },

  fieldsRow: {
    gap: 12,
  },

  fieldColumn: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "900",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    fontSize: 13,
  },

  actions: {
    gap: 10,
    marginTop: 2,
  },

  cancelButton: {
    minHeight: 50,
    minWidth: 130,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 13,
    fontWeight: "900",
  },

  saveButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveText: {
    fontSize: 13,
    fontWeight: "900",
  },
});