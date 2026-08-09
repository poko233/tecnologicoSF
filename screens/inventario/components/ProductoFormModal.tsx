import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

import { createInventarioStyles } from "../styles/inventario.styles";

import {
  InventarioCategoria,
  InventarioProducto,
  ProductoForm,
  ProductoPayload,
} from "../types/inventario.types";

import {
  ProductoFormErrors,
  productoAForm,
  productoFormAPayload,
  validarProductoForm,
} from "../utils/inventario.utils";

type Props = {
  visible: boolean;
  producto: InventarioProducto | null;
  categorias: InventarioCategoria[];
  guardando: boolean;

  onClose: () => void;

  onSave: (
    payload: ProductoPayload,
    producto?: InventarioProducto | null,
  ) => Promise<InventarioProducto | null>;
};

export default function ProductoFormModal({
  visible,
  producto,
  categorias,
  guardando,
  onClose,
  onSave,
}: Props) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width < 720;

  const styles = useMemo(
    () =>
      createInventarioStyles(
        theme.colors,
        isMobile,
        width < 1100,
      ),
    [theme.colors, isMobile, width],
  );

  const [form, setForm] =
    useState<ProductoForm>(() =>
      productoAForm(producto),
    );

  const [errors, setErrors] =
    useState<ProductoFormErrors>({});

  const [
    mostrarCategorias,
    setMostrarCategorias,
  ] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setForm(productoAForm(producto));
    setErrors({});
    setMostrarCategorias(false);
  }, [visible, producto]);

  const actualizar = (
    campo: keyof ProductoForm,
    value: string,
  ) => {
    setForm((actual) => ({
      ...actual,
      [campo]: value,
    }));

    setErrors((actual) => ({
      ...actual,
      [campo]: undefined,
    }));
  };

  const guardar = async () => {
    const encontrados =
      validarProductoForm(form);

    if (
      Object.keys(encontrados).length > 0
    ) {
      setErrors(encontrados);

      Toast.show({
        type: "error",
        text1: "Revisa los campos",
        text2:
          Object.values(encontrados).find(
            Boolean,
          ),
      });

      return;
    }

    const resultado = await onSave(
      productoFormAPayload(form),
      producto,
    );

    if (resultado) {
      onClose();
    }
  };

  const categoriaSeleccionada =
    categorias.find(
      (item) =>
        String(item.idCategoria) ===
        form.idCategoria,
    );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View
              style={styles.modalHeaderIcon}
            >
              <Ionicons
                name={
                  producto
                    ? "create-outline"
                    : "cube-outline"
                }
                size={24}
                color={theme.colors.primary}
              />
            </View>

            <View
              style={styles.modalHeaderText}
            >
              <ThemedText
                style={styles.modalTitle}
              >
                {producto
                  ? "Editar producto"
                  : "Registrar producto"}
              </ThemedText>

              <ThemedText
                style={styles.modalSubtitle}
              >
                Registra la información,
                precios, categoría y estado
                del producto.
              </ThemedText>
            </View>

            <Pressable
              disabled={guardando}
              onPress={onClose}
              style={[
                styles.closeButton,
                guardando &&
                  styles.disabled,
              ]}
            >
              <Ionicons
                name="close"
                size={23}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={
              styles.modalContent
            }
            showsVerticalScrollIndicator
          >
            {/* INFORMACIÓN */}
            <View
              style={styles.formSection}
            >
              <ThemedText
                style={
                  styles.formSectionTitle
                }
              >
                Información del producto
              </ThemedText>

              <ThemedText
                style={
                  styles.formSectionSubtitle
                }
              >
                El SKU identifica al
                producto y no puede
                repetirse.
              </ThemedText>

              <View
                style={styles.formGrid}
              >
                <Campo
                  label="SKU *"
                  value={form.sku}
                  error={errors.sku}
                  placeholder="Ej.: CAM-001"
                  onChangeText={(value) =>
                    actualizar("sku", value)
                  }
                  styles={styles}
                  full
                />

                <Campo
                  label="Nombre *"
                  value={form.nombre}
                  error={errors.nombre}
                  placeholder="Nombre del producto"
                  onChangeText={(value) =>
                    actualizar(
                      "nombre",
                      value,
                    )
                  }
                  styles={styles}
                  full
                />

                <Campo
                  label="Descripción"
                  value={form.descripcion}
                  error={
                    errors.descripcion
                  }
                  placeholder="Descripción, características o detalles"
                  onChangeText={(value) =>
                    actualizar(
                      "descripcion",
                      value,
                    )
                  }
                  styles={styles}
                  multiline
                  full
                />
              </View>
            </View>

            {/* PRECIOS */}
            <View
              style={styles.formSection}
            >
              <ThemedText
                style={
                  styles.formSectionTitle
                }
              >
                Precios
              </ThemedText>

              <ThemedText
                style={
                  styles.formSectionSubtitle
                }
              >
                Registra los precios del
                producto. El precio con
                descuento es opcional.
              </ThemedText>

              <View
                style={styles.formGrid}
              >
                <Campo
                  label="Precio de compra"
                  value={
                    form.precioCompra
                  }
                  error={
                    errors.precioCompra
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  onChangeText={(value) =>
                    actualizar(
                      "precioCompra",
                      value,
                    )
                  }
                  styles={styles}
                />

                <Campo
                  label="Precio de venta *"
                  value={
                    form.precioVenta
                  }
                  error={
                    errors.precioVenta
                  }
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  onChangeText={(value) =>
                    actualizar(
                      "precioVenta",
                      value,
                    )
                  }
                  styles={styles}
                />

                <Campo
                  label="Precio con descuento"
                  value={
                    form.precioDescuento
                  }
                  error={
                    errors.precioDescuento
                  }
                  placeholder="Opcional"
                  keyboardType="decimal-pad"
                  onChangeText={(value) =>
                    actualizar(
                      "precioDescuento",
                      value,
                    )
                  }
                  styles={styles}
                />
              </View>
            </View>

            {/* CLASIFICACIÓN */}
            <View
              style={styles.formSection}
            >
              <ThemedText
                style={
                  styles.formSectionTitle
                }
              >
                Clasificación y estado
              </ThemedText>

              <ThemedText
                style={
                  styles.formSectionSubtitle
                }
              >
                Selecciona la categoría a
                la que pertenece el
                producto.
              </ThemedText>

              <ThemedText
                style={styles.label}
              >
                Categoría
              </ThemedText>

              <Pressable
                onPress={() =>
                  setMostrarCategorias(
                    (actual) => !actual,
                  )
                }
                style={
                  styles.selectorButton
                }
              >
                <ThemedText
                  style={
                    styles.selectorValue
                  }
                >
                  {categoriaSeleccionada?.nombre ||
                    "Sin categoría"}
                </ThemedText>

                <Ionicons
                  name={
                    mostrarCategorias
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={18}
                  color={theme.colors.text}
                />
              </Pressable>

              {mostrarCategorias && (
                <View
                  style={styles.chips}
                >
                  <Pressable
                    onPress={() => {
                      actualizar(
                        "idCategoria",
                        "",
                      );
                      setMostrarCategorias(
                        false,
                      );
                    }}
                    style={[
                      styles.chip,
                      !form.idCategoria &&
                        styles.chipActive,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.chipText,
                        !form.idCategoria &&
                          styles.chipTextActive,
                      ]}
                    >
                      Sin categoría
                    </ThemedText>
                  </Pressable>

                  {categorias
                    .filter(
                      (categoria) =>
                        categoria.estado ===
                          "ACTIVO" ||
                        String(
                          categoria.idCategoria,
                        ) ===
                          form.idCategoria,
                    )
                    .map((categoria) => {
                      const activa =
                        String(
                          categoria.idCategoria,
                        ) ===
                        form.idCategoria;

                      return (
                        <Pressable
                          key={
                            categoria.idCategoria
                          }
                          onPress={() => {
                            actualizar(
                              "idCategoria",
                              String(
                                categoria.idCategoria,
                              ),
                            );

                            setMostrarCategorias(
                              false,
                            );
                          }}
                          style={[
                            styles.chip,
                            activa &&
                              styles.chipActive,
                          ]}
                        >
                          <ThemedText
                            style={[
                              styles.chipText,
                              activa &&
                                styles.chipTextActive,
                            ]}
                          >
                            {
                              categoria.nombre
                            }
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                </View>
              )}

              <ThemedText
                style={styles.label}
              >
                Estado del producto
              </ThemedText>

              <View style={styles.chips}>
                {(
                  [
                    "ACTIVO",
                    "INACTIVO",
                  ] as const
                ).map((estado) => {
                  const activo =
                    form.estado === estado;

                  return (
                    <Pressable
                      key={estado}
                      onPress={() =>
                        actualizar(
                          "estado",
                          estado,
                        )
                      }
                      style={[
                        styles.chip,
                        activo &&
                          styles.chipActive,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          activo &&
                            styles.chipTextActive,
                        ]}
                      >
                        {estado === "ACTIVO"
                          ? "Activado"
                          : "Desactivado"}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View
            style={styles.modalFooter}
          >
            <Pressable
              disabled={guardando}
              onPress={onClose}
              style={[
                styles.cancelButton,
                guardando &&
                  styles.disabled,
              ]}
            >
              <ThemedText
                style={
                  styles.cancelButtonText
                }
              >
                Cancelar
              </ThemedText>
            </Pressable>

            <Pressable
              disabled={guardando}
              onPress={() => void guardar()}
              style={[
                styles.saveButton,
                guardando &&
                  styles.disabled,
              ]}
            >
              {guardando ? (
                <ActivityIndicator
                  color={
                    theme.colors
                      .primaryForeground
                  }
                />
              ) : (
                <Ionicons
                  name="save-outline"
                  size={18}
                  color={
                    theme.colors
                      .primaryForeground
                  }
                />
              )}

              <ThemedText
                style={
                  styles.saveButtonText
                }
              >
                {guardando
                  ? "Guardando..."
                  : producto
                    ? "Guardar cambios"
                    : "Crear producto"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Campo({
  label,
  value,
  error,
  placeholder,
  onChangeText,
  styles,
  multiline = false,
  full = false,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChangeText: (
    value: string,
  ) => void;
  styles: ReturnType<
    typeof createInventarioStyles
  >;
  multiline?: boolean;
  full?: boolean;
  keyboardType?:
    | "default"
    | "number-pad"
    | "decimal-pad";
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.field,
        full && styles.fieldFull,
      ]}
    >
      <ThemedText
        style={styles.label}
      >
        {label}
      </ThemedText>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={
          theme.colors.textMuted ||
          theme.colors.textSecondary
        }
        multiline={multiline}
        keyboardType={keyboardType}
        style={[
          styles.input,
          multiline &&
            styles.textArea,
          error && {
            borderColor:
              theme.colors.destructive ||
              "#DC2626",
          },
        ]}
      />

      {!!error && (
        <ThemedText
          style={styles.fieldError}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
}