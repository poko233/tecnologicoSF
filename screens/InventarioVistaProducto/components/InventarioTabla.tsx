import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
    useWindowDimensions,
    View,
} from "react-native";

import { ThemedText } from "../../../components/ThemedText";
import { useTheme } from "../../../theme/useTheme";

import { createInventarioVistaProductoStyles } from "../styles/inventarioVistaProducto.styles";

import { InventarioVistaProducto } from "../types/inventarioVistaProducto.types";

import {
    formatearNumero,
    obtenerEstadoProductoLabel,
    obtenerEstadoStockLabel,
} from "../utils/inventarioVistaProducto.utils";

import InventarioProductoImagen from "./InventarioProductoImagen";

type Props = {
  productos:
    InventarioVistaProducto[];
};

type StylesType = ReturnType<
  typeof createInventarioVistaProductoStyles
>;

export default function InventarioTabla({
  productos,
}: Props) {
  const { theme } = useTheme();

  const { width } =
    useWindowDimensions();

  const isMobile =
    width < 760;

  const isCompact =
    width < 1120;

  const styles = useMemo(
    () =>
      createInventarioVistaProductoStyles(
        theme.colors,
        isMobile,
        isCompact,
      ),
    [
      theme.colors,
      isMobile,
      isCompact,
    ],
  );

  /*
  |--------------------------------------------------------------------------
  | MOBILE
  |--------------------------------------------------------------------------
  */

  if (isMobile) {
    return (
      <View
        style={styles.mobileList}
      >
        {productos.map(
          (producto) => (
            <ProductoMobile
              key={
                producto.idProducto
              }
              producto={
                producto
              }
              colors={
                theme.colors
              }
              styles={
                styles
              }
            />
          ),
        )}
      </View>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DESKTOP
  |--------------------------------------------------------------------------
  */

  return (
    <View
      style={styles.tableShell}
    >
      {/* =====================================================
          CABECERA
      ===================================================== */}

      <View
        style={styles.tableHeader}
      >
        <ThemedText
          style={[
            styles.headerText,
            styles.colProducto,
          ]}
        >
          Producto
        </ThemedText>

        <ThemedText
          style={[
            styles.headerText,
            styles.colSku,
          ]}
        >
          SKU
        </ThemedText>

        {!isCompact && (
          <ThemedText
            style={[
              styles.headerText,
              styles.colCategoria,
            ]}
          >
            Categoría
          </ThemedText>
        )}

        <ThemedText
          style={[
            styles.headerText,
            styles.colUnidad,
          ]}
        >
          Unidad
        </ThemedText>

        <ThemedText
          style={[
            styles.headerText,
            styles.colCantidad,
          ]}
        >
          Cantidad
        </ThemedText>

        <ThemedText
          style={[
            styles.headerText,
            styles.colExistencia,
          ]}
        >
          Existencia
        </ThemedText>
      </View>

      {/* =====================================================
          FILAS
      ===================================================== */}

      {productos.map(
        (
          producto,
          index,
        ) => (
          <ProductoDesktop
            key={
              producto.idProducto
            }
            producto={
              producto
            }
            index={index}
            ultimo={
              index ===
              productos.length - 1
            }
            isCompact={
              isCompact
            }
            colors={
              theme.colors
            }
            styles={
              styles
            }
          />
        ),
      )}
    </View>
  );
}

/* ==========================================================================
   PRODUCTO DESKTOP
============================================================================ */

function ProductoDesktop({
  producto,
  index,
  ultimo,
  isCompact,
  colors,
  styles,
}: {
  producto:
    InventarioVistaProducto;

  index: number;

  ultimo: boolean;

  isCompact: boolean;

  colors: any;

  styles: StylesType;
}) {
  const stockColor =
    obtenerStockColor(
      producto.estadoStock,
      colors,
    );

  return (
    <View
      style={[
        styles.tableRow,

        index % 2 === 1 &&
          styles.tableRowAlt,

        ultimo &&
          styles.tableRowLast,
      ]}
    >
      {/* =====================================================
          PRODUCTO + IMAGEN
      ===================================================== */}

      <View
        style={styles.colProducto}
      >
        <View
          style={styles.productCell}
        >
          <InventarioProductoImagen
            uri={
              producto
                .imagenPrincipal
            }
            nombre={
              producto.nombre
            }
            colors={
              colors
            }
            styles={
              styles
            }
          />

          <View
            style={
              styles.productTextBox
            }
          >
            <ThemedText
              numberOfLines={1}
              style={
                styles.productName
              }
            >
              {producto.nombre}
            </ThemedText>

            <ThemedText
              numberOfLines={1}
              style={
                styles.productStatus
              }
            >
              {obtenerEstadoProductoLabel(
                producto.estado,
              )}

              {isCompact
                ? ` · ${
                    producto
                      .categoria
                      ?.nombre ??
                    "Sin categoría"
                  }`
                : ""}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* =====================================================
          SKU
      ===================================================== */}

      <View
        style={styles.colSku}
      >
        <View
          style={styles.skuBadge}
        >
          <ThemedText
            numberOfLines={1}
            style={styles.skuText}
          >
            {producto.sku ||
              "—"}
          </ThemedText>
        </View>
      </View>

      {/* =====================================================
          CATEGORÍA
      ===================================================== */}

      {!isCompact && (
        <View
          style={
            styles.colCategoria
          }
        >
          <ThemedText
            numberOfLines={1}
            style={styles.cellText}
          >
            {producto
              .categoria
              ?.nombre ??
              "Sin categoría"}
          </ThemedText>
        </View>
      )}

      {/* =====================================================
          UNIDAD
      ===================================================== */}

      <View
        style={styles.colUnidad}
      >
        <ThemedText
          numberOfLines={1}
          style={styles.cellText}
        >
          {producto
            .unidadMedida ||
            "Unidad"}
        </ThemedText>
      </View>

      {/* =====================================================
          CANTIDAD
      ===================================================== */}

      <View
        style={
          styles.colCantidad
        }
      >
        <ThemedText
          style={
            styles.quantityValue
          }
        >
          {formatearNumero(
            producto.stock,
          )}
        </ThemedText>
      </View>

      {/* =====================================================
          EXISTENCIA
      ===================================================== */}

      <View
        style={
          styles.colExistencia
        }
      >
        <StockBadge
          producto={
            producto
          }
          color={
            stockColor
          }
          styles={
            styles
          }
        />
      </View>
    </View>
  );
}

/* ==========================================================================
   PRODUCTO MOBILE
============================================================================ */

function ProductoMobile({
  producto,
  colors,
  styles,
}: {
  producto:
    InventarioVistaProducto;

  colors: any;

  styles: StylesType;
}) {
  const stockColor =
    obtenerStockColor(
      producto.estadoStock,
      colors,
    );

  return (
    <View
      style={styles.mobileCard}
    >
      {/* =====================================================
          PRODUCTO
      ===================================================== */}

      <View
        style={
          styles.mobileHeader
        }
      >
        <View
          style={
            styles.mobileProductIdentity
          }
        >
          <InventarioProductoImagen
            uri={
              producto
                .imagenPrincipal
            }
            nombre={
              producto.nombre
            }
            colors={
              colors
            }
            styles={
              styles
            }
            mobile
          />

          <View
            style={
              styles.mobileHeaderText
            }
          >
            <ThemedText
              numberOfLines={2}
              style={
                styles.mobileTitle
              }
            >
              {producto.nombre}
            </ThemedText>

            <ThemedText
              style={
                styles.mobileSku
              }
            >
              SKU:{" "}
              {producto.sku ||
                "—"}
            </ThemedText>
          </View>
        </View>

        <StockBadge
          producto={
            producto
          }
          color={
            stockColor
          }
          styles={
            styles
          }
        />
      </View>

      {/* =====================================================
          INFORMACIÓN
      ===================================================== */}

      <View
        style={
          styles.mobileInfoRow
        }
      >
        <View
          style={
            styles.mobileInfoItem
          }
        >
          <ThemedText
            style={
              styles.mobileInfoLabel
            }
          >
            Categoría
          </ThemedText>

          <ThemedText
            numberOfLines={1}
            style={
              styles.mobileInfoValue
            }
          >
            {producto
              .categoria
              ?.nombre ??
              "Sin categoría"}
          </ThemedText>
        </View>

        <View
          style={
            styles.mobileInfoItem
          }
        >
          <ThemedText
            style={
              styles.mobileInfoLabel
            }
          >
            Unidad
          </ThemedText>

          <ThemedText
            style={
              styles.mobileInfoValue
            }
          >
            {producto
              .unidadMedida ||
              "Unidad"}
          </ThemedText>
        </View>
      </View>

      {/* =====================================================
          CANTIDAD
      ===================================================== */}

      <View
        style={
          styles.mobileQuantity
        }
      >
        <View
          style={
            styles.mobileQuantityText
          }
        >
          <ThemedText
            style={
              styles.mobileQuantityLabel
            }
          >
            Cantidad disponible
          </ThemedText>

          <ThemedText
            style={
              styles.mobileQuantitySub
            }
          >
            Existencia actual del
            producto
          </ThemedText>
        </View>

        <ThemedText
          style={
            styles.mobileQuantityValue
          }
        >
          {formatearNumero(
            producto.stock,
          )}
        </ThemedText>
      </View>
    </View>
  );
}

/* ==========================================================================
   BADGE DE STOCK
============================================================================ */

function StockBadge({
  producto,
  color,
  styles,
}: {
  producto:
    InventarioVistaProducto;

  color: string;

  styles: StylesType;
}) {
  const icon:
    keyof typeof Ionicons.glyphMap =
    producto.estadoStock ===
    "DISPONIBLE"
      ? "checkmark-circle-outline"
      : producto.estadoStock ===
          "BAJO"
        ? "alert-circle-outline"
        : "close-circle-outline";

  return (
    <View
      style={[
        styles.stockBadge,

        {
          backgroundColor:
            `${color}14`,

          borderColor:
            `${color}45`,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={15}
        color={color}
      />

      <ThemedText
        style={[
          styles.stockBadgeText,

          {
            color,
          },
        ]}
      >
        {obtenerEstadoStockLabel(
          producto.estadoStock,
        )}
      </ThemedText>
    </View>
  );
}

/* ==========================================================================
   COLOR DEL STOCK
============================================================================ */

function obtenerStockColor(
  estado:
    InventarioVistaProducto["estadoStock"],
  colors: any,
): string {
  if (
    estado ===
    "DISPONIBLE"
  ) {
    return (
      colors.success ||
      "#16A34A"
    );
  }

  if (
    estado ===
    "BAJO"
  ) {
    return "#D97706";
  }

  return (
    colors.destructive ||
    "#DC2626"
  );
}