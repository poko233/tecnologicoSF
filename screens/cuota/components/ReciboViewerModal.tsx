// screens/cuota/components/ReciboViewerModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    Share,
    Text,
    View,
} from "react-native";
import { WebView } from "react-native-webview";
import { BASE_URL } from "../../../http/httpClient";
import { getToken } from "../../../storage/secureStorage";
import { useTheme } from "../../../theme/useTheme";

interface ReciboViewerModalProps {
  visible: boolean;
  idPago: number | null;
  onClose: () => void;
}

export const ReciboViewerModal: React.FC<ReciboViewerModalProps> = ({
  visible,
  idPago,
  onClose,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { height } = Dimensions.get("window");

  // URL del recibo (inline, no descarga)
  const reciboUrl = idPago
    ? `${BASE_URL}/api/pagos/${idPago}/recibo`
    : null;

  // Cargar token al abrir
  useEffect(() => {
    if (visible) {
      getToken().then(setToken);
    }
  }, [visible]);

  // Animación de entrada/salida
  useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(false);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  const handleShare = async () => {
    if (!reciboUrl) return;
    try {
      await Share.share({ url: reciboUrl });
    } catch (e) {
      console.error("Error al compartir:", e);
    }
  };

  // HTML que carga el PDF autenticado dentro del WebView usando fetch + blob
  const buildHtml = (url: string, authToken: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f5f5f5; display: flex; align-items: center; justify-content: center; height: 100vh; }
        iframe { width: 100vw; height: 100vh; border: none; background: white; }
        #error { display: none; text-align: center; font-family: sans-serif; color: #666; padding: 32px; }
        #error p { font-size: 14px; margin-top: 8px; }
      </style>
    </head>
    <body>
      <iframe id="pdf-frame"></iframe>
      <div id="error">
        <p style="font-size:32px">⚠️</p>
        <p>No se pudo cargar el recibo.</p>
      </div>
      <script>
        fetch("${url}", {
          headers: { "Authorization": "Bearer ${authToken}", "Accept": "application/pdf" }
        })
        .then(function(res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.blob();
        })
        .then(function(blob) {
          var blobUrl = URL.createObjectURL(blob);
          document.getElementById("pdf-frame").src = blobUrl;
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage("loaded");
        })
        .catch(function(err) {
          document.getElementById("pdf-frame").style.display = "none";
          document.getElementById("error").style.display = "block";
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage("error:" + err.message);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          alignItems: "center",      
          justifyContent: "center", 

        }}
      >
        {/* Backdrop tap para cerrar */}
        <Pressable
          style={{ position: "absolute", inset: 0 }}
          onPress={onClose}
        />

        {/* Panel principal */}
        <Animated.View
          style={{
            transform: [{ translateY }],
            width: "100%",
            maxWidth: 860,             // ← ancho máximo escritorio
            height: height * 0.85,
            backgroundColor: theme.colors.card,
            borderRadius: 16,          // ← esquinas completas
            overflow: "hidden",
          }}
        >
          {/* ── Header ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderColor: theme.colors.border,
              gap: 12,
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                position: "absolute",
                top: 8,
                alignSelf: "center",
                left: "50%",
                marginLeft: -20,
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.colors.border,
              }}
            />

            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: theme.colors.primary + "18",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="receipt-outline"
                size={20}
                color={theme.colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: theme.colors.text,
                }}
              >
                Recibo de Pago
              </Text>
              {idPago && (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  #{String(idPago).padStart(6, "0")}
                </Text>
              )}
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: theme.colors.backgroundSecondary,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* ── Contenido ── */}
          <View style={{ flex: 1 }}>
            {!reciboUrl || !token ? (
              // Sin URL o sin token todavía
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: theme.colors.textSecondary, fontFamily: "Inter_400Regular" }}>
                  Preparando recibo...
                </Text>
              </View>
            ) : error ? (
              // Estado de error
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 }}>
                <View style={{
                  width: 64, height: 64, borderRadius: 20,
                  backgroundColor: theme.colors.destructive + "15",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name="cloud-offline-outline" size={32} color={theme.colors.destructive} />
                </View>
                <Text style={{ color: theme.colors.text, fontFamily: "Inter_600SemiBold", fontSize: 16, textAlign: "center" }}>
                  No se pudo cargar el recibo
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" }}>
                  Verifica tu conexión e intenta nuevamente.
                </Text>
                <Pressable
                  onPress={() => { setError(false); setLoading(true); }}
                  style={({ pressed }) => ({
                    marginTop: 8, paddingHorizontal: 24, paddingVertical: 10,
                    borderRadius: 12, backgroundColor: theme.colors.primary,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: theme.colors.primaryForeground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                    Reintentar
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Spinner de carga encima del WebView */}
                {loading && (
                  <View style={{
                    position: "absolute", inset: 0, zIndex: 10,
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: theme.colors.card, gap: 16,
                  }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 }}>
                      Cargando recibo...
                    </Text>
                  </View>
                )}

                {Platform.OS === "web" ? (
                <iframe
                    src={`${reciboUrl}?token=${token}`}
                    style={{
                    flex: 1,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    } as any}
                    onLoad={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                />
                ) : (
                <WebView
                    key={`recibo-${idPago}-${error}`}
                    originWhitelist={["*"]}
                    source={{ html: buildHtml(reciboUrl, token) }}
                    style={{ flex: 1, backgroundColor: theme.colors.card }}
                    javaScriptEnabled
                    domStorageEnabled
                    onMessage={(e) => {
                    const msg = e.nativeEvent.data;
                    if (msg === "loaded") setLoading(false);
                    else if (msg.startsWith("error:")) {
                        setLoading(false);
                        setError(true);
                    }
                    }}
                    onError={() => { setLoading(false); setError(true); }}
                />
                )}
              </>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};