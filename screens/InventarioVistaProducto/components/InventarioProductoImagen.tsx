import { Ionicons } from "@expo/vector-icons";
import {
    useEffect,
    useState,
} from "react";
import {
    Image,
    View,
} from "react-native";

import { InventarioVistaProductoStyles } from "../styles/inventarioVistaProducto.styles";

type Props = {
  uri?: string | null;

  nombre?: string;

  colors: any;

  styles:
    InventarioVistaProductoStyles;

  mobile?: boolean;
};

export default function InventarioProductoImagen({
  uri,
  nombre,
  colors,
  styles,
  mobile = false,
}: Props) {
  const [errorImagen, setErrorImagen] =
    useState(false);

  /*
   * Si cambia la URL,
   * permite intentar cargar de nuevo.
   */
  useEffect(() => {
    setErrorImagen(false);
  }, [uri]);

  const mostrarImagen =
    !!uri &&
    !errorImagen;

  const containerStyle =
    mobile
      ? styles.productImageMobileContainer
      : styles.productImageContainer;

  const imageStyle =
    mobile
      ? styles.productImageMobile
      : styles.productImage;

  if (mostrarImagen) {
    return (
      <View style={containerStyle}>
        <Image
          source={{
            uri,
          }}
          resizeMode="cover"
          style={imageStyle}
          accessibilityLabel={
            nombre
              ? `Imagen de ${nombre}`
              : "Imagen del producto"
          }
          onError={() => {
            setErrorImagen(true);
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        containerStyle,

        styles.productImagePlaceholder,
      ]}
    >
      <Ionicons
        name="image-outline"
        size={mobile ? 27 : 23}
        color={
          colors.textMuted ||
          colors.textSecondary
        }
      />
    </View>
  );
}