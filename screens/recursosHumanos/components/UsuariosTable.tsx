import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";
import { UsuarioRRHH } from "../types/recursosHumanos.types";

type Props = {
  usuarios: UsuarioRRHH[];
  loading: boolean;
  onEditar: (usuario: UsuarioRRHH) => void;
  onRefresh: () => void;
};

const PAGE_SIZE = 8;

function obtenerRoles(usuario: UsuarioRRHH) {
  return (
    usuario.roles
      ?.map((rol) => rol.rol)
      .filter(Boolean)
      .join(", ") || "Sin rol"
  );
}

function nombreCompleto(usuario: UsuarioRRHH) {
  return `${usuario.nombres || ""} ${usuario.apellidoPaterno || ""} ${
    usuario.apellidoMaterno || ""
  }`.trim();
}

function obtenerIniciales(usuario: UsuarioRRHH) {
  const nombre = nombreCompleto(usuario);

  if (!nombre) {
    return "U";
  }

  const partes = nombre.split(" ").filter(Boolean);

  if (partes.length === 1) {
    return partes[0].charAt(0).toUpperCase();
  }

  return `${partes[0].charAt(0)}${partes[1].charAt(0)}`.toUpperCase();
}

export default function UsuariosTable({
  usuarios,
  loading,
  onEditar,
  onRefresh,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { width } = useWindowDimensions();

  const isMobile = width < 760;
  const isCompact = width < 1120;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const data = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return usuarios;
    }

    return usuarios.filter((usuario) =>
      [
        usuario.usuario,
        usuario.ci,
        usuario.nombres,
        usuario.apellidoPaterno,
        usuario.apellidoMaterno || "",
        usuario.email || "",
        usuario.celular || "",
        usuario.estado,
        usuario.expedido || "",
        obtenerRoles(usuario),
        usuario.observacionPromociones || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [usuarios, search]);

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const limpiarBusqueda = () => {
    setSearch("");
    setPage(1);
  };

  const styles = createStyles(colors, isMobile, isCompact);

  return (
    <View style={styles.card}>
      <View style={[styles.top, isMobile && styles.topMobile]}>
        <View style={styles.topTextBox}>
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Ionicons
                name="people-outline"
                size={22}
                color={colors.primary}
              />
            </View>

            <View style={styles.titleTextBox}>
              <ThemedText style={styles.title}>Usuarios del sistema</ThemedText>

              <ThemedText style={styles.subtitle}>
                {data.length} usuario(s) encontrados
              </ThemedText>
            </View>
          </View>
        </View>

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
            color={colors.primaryForeground}
          />

          {!isMobile && (
            <ThemedText style={styles.refreshText}>Actualizar</ThemedText>
          )}
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={19} color={colors.textMuted} />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre, CI, correo, rol, estado u observación..."
          placeholderTextColor={colors.textMuted}
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
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />

          <ThemedText style={styles.loadingText}>
            Cargando usuarios...
          </ThemedText>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="people-outline"
              size={40}
              color={colors.textMuted}
            />
          </View>

          <ThemedText style={styles.emptyTitle}>
            No se encontraron usuarios
          </ThemedText>

          <ThemedText style={styles.emptyText}>
            Prueba con otro nombre, CI, correo, rol o estado.
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
                      Usuario
                    </ThemedText>

                    <ThemedText
                      style={[styles.headerText, styles.headerDatosCompact]}
                    >
                      Datos y contacto
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
                      Usuario
                    </ThemedText>

                    <ThemedText
                      style={[styles.headerText, styles.headerContacto]}
                    >
                      Contacto
                    </ThemedText>

                    <ThemedText
                      style={[styles.headerText, styles.headerRol]}
                    >
                      Roles y observaciones
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
              {paginatedData.map((usuario, index) => {
                const nombre = nombreCompleto(usuario);
                const roles = obtenerRoles(usuario);
                const estadoActivo = usuario.estado === "ACTIVO";

                if (isMobile) {
                  return (
                    <MobileUsuarioCard
                      key={usuario.id}
                      usuario={usuario}
                      nombre={nombre}
                      roles={roles}
                      estadoActivo={estadoActivo}
                      colors={colors}
                      styles={styles}
                      onEditar={() => onEditar(usuario)}
                    />
                  );
                }

                return (
                  <View
                    key={usuario.id}
                    style={[
                      styles.row,
                      index % 2 === 1 && styles.rowAlt,
                    ]}
                  >
                    {isCompact ? (
                      <>
                        <View style={styles.usuarioCompactCell}>
                          <UsuarioResumen
                            usuario={usuario}
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
                            CI: {usuario.ci || "—"}{" "}
                            {usuario.expedido
                              ? `· ${usuario.expedido}`
                              : ""}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.compactSecondary}
                          >
                            {usuario.email || "Sin correo"}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.compactSecondary}
                          >
                            {usuario.celular || "Sin celular"} · {roles}
                          </ThemedText>

                          {!!usuario.observacionPromociones && (
                            <ThemedText
                              numberOfLines={1}
                              style={styles.observacionCompact}
                            >
                              Obs.: {usuario.observacionPromociones}
                            </ThemedText>
                          )}
                        </View>

                        <View style={styles.estadoCompactCell}>
                          <EstadoBadge
                            estado={usuario.estado}
                            activo={estadoActivo}
                            styles={styles}
                          />
                        </View>

                        <View style={styles.accionCompactCell}>
                          <EditarButton
                            compact
                            colors={colors}
                            styles={styles}
                            onPress={() => onEditar(usuario)}
                          />
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.usuarioCell}>
                          <UsuarioResumen
                            usuario={usuario}
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
                            {usuario.email || "Sin correo"}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.contactSecondary}
                          >
                            {usuario.celular || "Sin celular"}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={1}
                            style={styles.contactSecondary}
                          >
                            CI: {usuario.ci || "—"}{" "}
                            {usuario.expedido
                              ? `· ${usuario.expedido}`
                              : ""}
                          </ThemedText>
                        </View>

                        <View style={styles.rolCell}>
                          <ThemedText numberOfLines={1} style={styles.rolText}>
                            {roles}
                          </ThemedText>

                          <ThemedText
                            numberOfLines={2}
                            style={styles.observacionText}
                          >
                            {usuario.observacionPromociones
                              ? `Obs.: ${usuario.observacionPromociones}`
                              : "Sin observaciones"}
                          </ThemedText>
                        </View>

                        <View style={styles.estadoCell}>
                          <EstadoBadge
                            estado={usuario.estado}
                            activo={estadoActivo}
                            styles={styles}
                          />
                        </View>

                        <View style={styles.accionCell}>
                          <EditarButton
                            colors={colors}
                            styles={styles}
                            onPress={() => onEditar(usuario)}
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
                onPress={() =>
                  setPage((prev) => Math.max(1, prev - 1))
                }
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={18}
                  color={colors.primaryForeground}
                />

                {!isMobile && (
                  <ThemedText style={styles.pageBtnText}>
                    Anterior
                  </ThemedText>
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
                  <ThemedText style={styles.pageBtnText}>
                    Siguiente
                  </ThemedText>
                )}

                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color={colors.primaryForeground}
                />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function UsuarioResumen({
  usuario,
  nombre,
  colors,
  styles,
  compacto = false,
}: {
  usuario: UsuarioRRHH;
  nombre: string;
  colors: any;
  styles: any;
  compacto?: boolean;
}) {
  return (
    <View style={styles.usuarioResumen}>
      <View style={styles.multimediaBox}>
        {usuario.fotoUrl ? (
          <Image source={{ uri: usuario.fotoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarEmpty}>
            <ThemedText style={styles.avatarLetters}>
              {obtenerIniciales(usuario)}
            </ThemedText>
          </View>
        )}

        {usuario.qrUrl ? (
          <Image source={{ uri: usuario.qrUrl }} style={styles.qrMini} />
        ) : (
          <View style={styles.qrMiniEmpty}>
            <Ionicons
              name="qr-code-outline"
              size={14}
              color={colors.textMuted}
            />
          </View>
        )}
      </View>

      <View style={styles.usuarioInfo}>
        <ThemedText numberOfLines={1} style={styles.nombreText}>
          {nombre || "Sin nombre"}
        </ThemedText>

        <ThemedText numberOfLines={1} style={styles.usuarioText}>
          @{usuario.usuario || "sin_usuario"}
        </ThemedText>

        {compacto && (
  <ThemedText numberOfLines={1} style={styles.compactCiText}>
    CI: {usuario.ci || "—"}{" "}
    {usuario.expedido ? `· ${usuario.expedido}` : ""}
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
  styles: any;
}) {
  return (
    <View
      style={[
        styles.badge,
        activo ? styles.badgeActive : styles.badgeInactive,
      ]}
    >
      <ThemedText style={styles.badgeText}>
        {estado || "SIN ESTADO"}
      </ThemedText>
    </View>
  );
}

function EditarButton({
  colors,
  styles,
  compact = false,
  onPress,
}: {
  colors: any;
  styles: any;
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
        name="create-outline"
        size={compact ? 18 : 16}
        color={colors.primaryForeground}
      />

      {!compact && (
        <ThemedText style={styles.editText}>Editar</ThemedText>
      )}
    </Pressable>
  );
}

function MobileUsuarioCard({
  usuario,
  nombre,
  roles,
  estadoActivo,
  colors,
  styles,
  onEditar,
}: {
  usuario: UsuarioRRHH;
  nombre: string;
  roles: string;
  estadoActivo: boolean;
  colors: any;
  styles: any;
  onEditar: () => void;
}) {
  return (
    <View style={styles.mobileCard}>
      <View style={styles.mobileCardTop}>
        <UsuarioResumen
          usuario={usuario}
          nombre={nombre}
          colors={colors}
          styles={styles}
        />

        <EstadoBadge
          estado={usuario.estado}
          activo={estadoActivo}
          styles={styles}
        />
      </View>

      <View style={styles.mobileDivider} />

      <View style={styles.mobileInfoGrid}>
        <MobileInfo
          label="Correo"
          value={usuario.email || "Sin correo"}
          styles={styles}
        />

        <MobileInfo
          label="Celular"
          value={usuario.celular || "Sin celular"}
          styles={styles}
        />

        <MobileInfo
          label="Roles"
          value={roles}
          styles={styles}
        />

        <MobileInfo
          label="Observaciones"
          value={usuario.observacionPromociones || "Sin observaciones"}
          styles={styles}
        />
      </View>

      <Pressable
        onPress={onEditar}
        style={({ pressed }) => [
          styles.mobileEditBtn,
          { opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <Ionicons
          name="create-outline"
          size={17}
          color={colors.primaryForeground}
        />

        <ThemedText style={styles.editText}>Editar usuario</ThemedText>
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
  styles: any;
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

function createStyles(colors: any, isMobile: boolean, isCompact: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: isMobile ? 14 : 18,
      gap: 14,
      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 18,
      elevation: 4,
    },

    top: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 14,
    },

    topMobile: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    topTextBox: {
      flex: 1,
      minWidth: 0,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },

    titleIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },

    titleTextBox: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: isMobile ? 20 : 23,
      fontWeight: "900",
      color: colors.text,
    },

    subtitle: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
    },

    refreshBtn: {
      minHeight: 42,
      backgroundColor: colors.primary,
      paddingHorizontal: isMobile ? 13 : 15,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      alignSelf: isMobile ? "flex-end" : "auto",
    },

    refreshText: {
      color: colors.primaryForeground,
      fontWeight: "900",
      fontSize: 13,
    },

    searchBox: {
      minHeight: 46,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.input,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      paddingVertical: 10,
    },

    loadingBox: {
      padding: 50,
      alignItems: "center",
      gap: 10,
    },

    loadingText: {
      color: colors.textSecondary,
      fontWeight: "700",
    },

    tableShell: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: "hidden",
    },

    headerRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      backgroundColor: colors.backgroundTertiary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    headerText: {
      paddingHorizontal: 8,
      fontSize: 10.5,
      fontWeight: "900",
      color: colors.textSecondary,
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },

    headerUsuario: {
      flex: 2.15,
    },

    headerContacto: {
      flex: 1.7,
    },

    headerRol: {
      flex: 2.15,
    },

    headerEstado: {
      flex: 0.85,
      textAlign: "center",
    },

    headerAccion: {
      flex: 0.85,
      textAlign: "center",
    },

    headerUsuarioCompact: {
      flex: 2.1,
    },

    headerDatosCompact: {
      flex: 2.55,
    },

    headerEstadoCompact: {
      flex: 0.9,
      textAlign: "center",
    },

    headerAccionCompact: {
      flex: 0.65,
      textAlign: "center",
    },

    rowsBox: {
      gap: 1,
      backgroundColor: colors.border,
    },

    row: {
      minHeight: 72,
      paddingHorizontal: 8,
      backgroundColor: colors.card,
      flexDirection: "row",
      alignItems: "center",
    },

    rowAlt: {
      backgroundColor: colors.backgroundSecondary,
    },

    usuarioCell: {
      flex: 2.15,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    contactoCell: {
      flex: 1.7,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    rolCell: {
      flex: 2.15,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    estadoCell: {
      flex: 0.85,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    accionCell: {
      flex: 0.85,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    usuarioCompactCell: {
      flex: 2.1,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    datosCompactCell: {
      flex: 2.55,
      paddingHorizontal: 8,
      minWidth: 0,
    },

    estadoCompactCell: {
      flex: 0.9,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    accionCompactCell: {
      flex: 0.65,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
    },

    usuarioResumen: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      minWidth: 0,
    },

    multimediaBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    avatar: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor: colors.backgroundSecondary,
    },

    avatarEmpty: {
      width: 38,
      height: 38,
      borderRadius: 13,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },

    avatarLetters: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "900",
    },

    qrMini: {
      width: 30,
      height: 30,
      borderRadius: 6,
      backgroundColor: "#FFFFFF",
    },

    qrMiniEmpty: {
      width: 30,
      height: 30,
      borderRadius: 7,
      backgroundColor: colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },

    usuarioInfo: {
      flex: 1,
      minWidth: 0,
    },

    nombreText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "900",
    },

    usuarioText: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 11.5,
      fontWeight: "700",
    },

    compactCiText: {
      marginTop: 2,
      color: colors.textMuted,
      fontSize: 10.5,
      fontWeight: "600",
    },

    contactPrimary: {
      color: colors.text,
      fontSize: 12.2,
      fontWeight: "800",
    },

    contactSecondary: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "600",
    },

    rolText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "800",
    },

    observacionText: {
      marginTop: 3,
      color: colors.textSecondary,
      fontSize: 10.8,
      fontWeight: "600",
      lineHeight: 15,
    },

    compactPrimary: {
      color: colors.text,
      fontSize: 12.3,
      fontWeight: "900",
    },

    compactSecondary: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 10.8,
      fontWeight: "600",
    },

    observacionCompact: {
      marginTop: 2,
      color: colors.textMuted,
      fontSize: 10.5,
      fontWeight: "600",
    },

    badge: {
      maxWidth: "100%",
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },

    badgeActive: {
      backgroundColor: colors.success,
    },

    badgeInactive: {
      backgroundColor: colors.destructive,
    },

    badgeText: {
      color: colors.primaryForeground,
      fontSize: 10,
      fontWeight: "900",
      textAlign: "center",
    },

    editBtn: {
      minHeight: 34,
      minWidth: 78,
      paddingHorizontal: 10,
      borderRadius: 11,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    editBtnCompact: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    editText: {
      color: colors.primaryForeground,
      fontWeight: "900",
      fontSize: 11.5,
    },

    mobileCard: {
      backgroundColor: colors.card,
      padding: 13,
      gap: 11,
    },

    mobileCardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
    },

    mobileDivider: {
      height: 1,
      backgroundColor: colors.border,
    },

    mobileInfoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    mobileInfoItem: {
      width: "47%",
      minWidth: 120,
    },

    mobileInfoLabel: {
      color: colors.textMuted,
      fontSize: 9.5,
      fontWeight: "900",
      textTransform: "uppercase",
    },

    mobileInfoValue: {
      marginTop: 3,
      color: colors.text,
      fontSize: 11.5,
      fontWeight: "700",
      lineHeight: 16,
    },

    mobileEditBtn: {
      minHeight: 40,
      borderRadius: 12,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    empty: {
      padding: 48,
      alignItems: "center",
      gap: 9,
    },

    emptyIcon: {
      width: 74,
      height: 74,
      borderRadius: 22,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
    },

    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "900",
    },

    emptyText: {
      color: colors.textSecondary,
      fontSize: 12.5,
      fontWeight: "600",
      textAlign: "center",
    },

    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingTop: 2,
    },

    paginationMobile: {
      flexDirection: "column",
      alignItems: "stretch",
    },

    pageActions: {
      flexDirection: "row",
      gap: 8,
      justifyContent: "flex-end",
    },

    pageBtn: {
      minHeight: 40,
      minWidth: isMobile ? 44 : 114,
      borderRadius: 13,
      backgroundColor: colors.primary,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    pageBtnText: {
      color: colors.primaryForeground,
      fontSize: 12,
      fontWeight: "900",
    },

    disabled: {
      opacity: 0.42,
    },

    pageInfo: {
      flex: isMobile ? 0 : 1,
      alignItems: isMobile ? "center" : "flex-start",
    },

    pageInfoText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "900",
    },

    pageInfoSub: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 11.5,
      fontWeight: "700",
    },
  });
}