import { ThemeContext } from "@/context/ThemeContext";
import { supabase } from "@/services/supabase/client";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ParametroCampoNumero } from "../ParametroCampo";

interface EnvioValores {
  recogidaLocal?: number;
  envioLocalDelivery?: number;
  envioNacionalCourier?: number;
}

interface EnvioSectionProps {
  envio: EnvioValores;
  empresaId?: string | null;
  onChange: (cambios: Partial<EnvioValores>) => void;
}

interface MetodoResumen {
  metodo: string;
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
}

export function EnvioSection({
  envio,
  empresaId,
  onChange,
}: EnvioSectionProps) {
  const { theme } = useContext(ThemeContext);

  const [cargandoFinanzas, setCargandoFinanzas] = useState(false);
  const [metodosResumen, setMetodosResumen] = useState<MetodoResumen[]>([]);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string>("");

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [subiendoQr, setSubiendoQr] = useState(false);

  useEffect(() => {
    if (!empresaId) return;

    const cargarDatosFinancierosYQr = async () => {
      setCargandoFinanzas(true);
      try {
        // 1. Cargar la URL del QR desde configuracion_empresa
        const { data: configData } = await supabase
          .from("configuracion_empresa")
          .select("qr_pago_url")
          .eq("empresa_id", empresaId)
          .maybeSingle();

        if (configData?.qr_pago_url) {
          setQrUrl(configData.qr_pago_url);
        }

        // 2. Cargar ingresos históricos por método
        const { data: ingresosData, error: errIng } = await supabase
          .from("ingresos")
          .select("metodo, monto")
          .eq("empresa_id", empresaId);

        if (errIng) throw errIng;

        // 3. Cargar egresos históricos por método
        const { data: egresosData, error: errEgr } = await supabase
          .from("egresos")
          .select("metodo, monto")
          .eq("empresa_id", empresaId);

        if (errEgr) throw errEgr;

        // 4. Agrupar dinámicamente por métodos de pago
        const mapaMetodos: Record<
          string,
          { ingresos: number; egresos: number }
        > = {};

        (ingresosData || []).forEach((item) => {
          const metodoNorm = (item.metodo || "OTRO").trim().toUpperCase();
          if (!mapaMetodos[metodoNorm]) {
            mapaMetodos[metodoNorm] = { ingresos: 0, egresos: 0 };
          }
          mapaMetodos[metodoNorm].ingresos += Number(item.monto ?? 0);
        });

        (egresosData || []).forEach((item) => {
          const metodoNorm = (item.metodo || "OTRO").trim().toUpperCase();
          if (!mapaMetodos[metodoNorm]) {
            mapaMetodos[metodoNorm] = { ingresos: 0, egresos: 0 };
          }
          mapaMetodos[metodoNorm].egresos += Number(item.monto ?? 0);
        });

        const resumenes: MetodoResumen[] = Object.keys(mapaMetodos).map(
          (key) => {
            const ing = mapaMetodos[key].ingresos;
            const egr = mapaMetodos[key].egresos;
            return {
              metodo: key,
              totalIngresos: ing,
              totalEgresos: egr,
              balance: ing - egr,
            };
          },
        );

        setMetodosResumen(resumenes);
        if (resumenes.length > 0) {
          setMetodoSeleccionado(resumenes[0].metodo);
        }
      } catch (error: any) {
        console.error("Error al cargar finanzas por método de pago:", error);
      } finally {
        setCargandoFinanzas(false);
      }
    };

    cargarDatosFinancierosYQr();
  }, [empresaId]);

  const seleccionarYSubirQr = async () => {
    if (!empresaId) {
      Alert.alert("Error", "No se encontró una empresa activa vinculada.");
      return;
    }

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permisos requeridos",
        "Se requieren permisos para acceder a la galería.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    setSubiendoQr(true);
    try {
      const imageAsset = result.assets[0];
      const extension = imageAsset.uri.split(".").pop()?.toLowerCase() || "jpg";
      const contentType = extension === "png" ? "image/png" : "image/jpeg";

      // 🛠️ MEJORA PROFESIONAL: Nombre estático fijo por empresa (sin Date.now())
      // Esto garantiza que siempre exista una sola imagen por empresa y se reemplace.
      const filePath = `qr/${empresaId}.${extension}`;

      // 1. Instanciar el archivo usando la API File de Expo SDK 54+
      const file = new File(imageAsset.uri);

      // 2. Obtener el ArrayBuffer de la imagen
      const arrayBuffer = await file.arrayBuffer();

      // 3. Subir/Reemplazar el archivo directamente en Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("empresa-assets")
        .upload(filePath, arrayBuffer, {
          contentType,
          upsert: true, // Reemplaza automáticamente el archivo con la misma ruta
        });

      if (uploadError) throw uploadError;

      // 4. Obtener la URL pública estática
      const { data: publicUrlData } = supabase.storage
        .from("empresa-assets")
        .getPublicUrl(filePath);

      const baseUrl = publicUrlData.publicUrl;

      // 5. Aplicar cache-busting (?t=timestamp) para forzar la actualización visual en la UI
      const urlConCacheBuster = `${baseUrl}?t=${Date.now()}`;

      // 6. Actualizar la base de datos con la URL limpia o con cache-buster
      const { error: dbError } = await supabase
        .from("configuracion_empresa")
        .upsert({ empresa_id: empresaId, qr_pago_url: urlConCacheBuster });

      if (dbError) throw dbError;

      setQrUrl(urlConCacheBuster);
      Alert.alert(
        "Éxito",
        "Código QR actualizado y reemplazado correctamente.",
      );
    } catch (err: any) {
      console.error("Error al subir QR:", err);
      Alert.alert("Error", err.message || "No se pudo subir la imagen del QR.");
    } finally {
      setSubiendoQr(false);
    }
  };

  const resumenActual = metodosResumen.find(
    (m) => m.metodo === metodoSeleccionado,
  );
  const esMetodoQr = metodoSeleccionado.includes("QR");

  return (
    <View style={styles.container}>
      <Text style={[styles.subtitulo, { color: theme.textPrimary }]}>
        Tarifas de Envío
      </Text>

      <ParametroCampoNumero
        label="Recogida en Local"
        value={envio.recogidaLocal ?? 0}
        onChange={(recogidaLocal) => onChange({ recogidaLocal })}
      />
      <ParametroCampoNumero
        label="Envíos Locales / Delivery"
        value={envio.envioLocalDelivery ?? 0}
        onChange={(envioLocalDelivery) => onChange({ envioLocalDelivery })}
      />
      <ParametroCampoNumero
        label="Envíos Nacionales / Courier"
        value={envio.envioNacionalCourier ?? 0}
        onChange={(envioNacionalCourier) => onChange({ envioNacionalCourier })}
      />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Text style={[styles.subtitulo, { color: theme.textPrimary }]}>
        Resumen Histórico por Métodos de Pago
      </Text>

      {cargandoFinanzas ? (
        <ActivityIndicator
          size="small"
          color={theme.primary}
          style={styles.loader}
        />
      ) : metodosResumen.length === 0 ? (
        <Text
          style={{
            color: theme.textMuted,
            fontStyle: "italic",
            marginBottom: 12,
          }}
        >
          No hay registros de ingresos o egresos por método de pago.
        </Text>
      ) : (
        <>
          <View style={styles.tabsContainer}>
            {metodosResumen.map((item) => {
              const activo = item.metodo === metodoSeleccionado;
              return (
                <Pressable
                  key={item.metodo}
                  style={[
                    styles.tabButton,
                    {
                      borderColor: activo ? theme.primary : theme.border,
                      backgroundColor: activo
                        ? theme.primary + "15"
                        : theme.bgSecondary,
                    },
                  ]}
                  onPress={() => setMetodoSeleccionado(item.metodo)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: activo ? theme.primary : theme.textMuted },
                    ]}
                  >
                    {item.metodo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {resumenActual && (
            <View
              style={[
                styles.cardResumen,
                {
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.filaMétrica}>
                <Text style={{ color: theme.textMuted }}>
                  Ingresos Totales:
                </Text>
                <Text style={[styles.valorMétrica, { color: "#10B981" }]}>
                  + {resumenActual.totalIngresos.toFixed(2)}
                </Text>
              </View>

              <View style={styles.filaMétrica}>
                <Text style={{ color: theme.textMuted }}>Egresos Totales:</Text>
                <Text style={[styles.valorMétrica, { color: "#EF4444" }]}>
                  - {resumenActual.totalEgresos.toFixed(2)}
                </Text>
              </View>

              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />

              <View style={styles.filaMétrica}>
                <Text style={{ color: theme.textPrimary, fontWeight: "700" }}>
                  Balance Net:
                </Text>
                <Text
                  style={[
                    styles.valorMétrica,
                    {
                      color:
                        resumenActual.balance >= 0 ? theme.primary : "#EF4444",
                    },
                  ]}
                >
                  {resumenActual.balance.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {esMetodoQr && (
            <View
              style={[
                styles.qrContainer,
                {
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.qrTitle, { color: theme.textPrimary }]}>
                Código QR de Cobros
              </Text>

              {qrUrl ? (
                <Image
                  source={{ uri: qrUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : (
                <View
                  style={[
                    styles.qrPlaceholder,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.bgPrimary,
                    },
                  ]}
                >
                  <Text style={{ color: theme.textMuted, fontSize: 13 }}>
                    No se ha configurado un QR
                  </Text>
                </View>
              )}

              <Pressable
                style={[
                  styles.botonQr,
                  { backgroundColor: theme.primary },
                  subiendoQr && { opacity: 0.6 },
                ]}
                onPress={seleccionarYSubirQr}
                disabled={subiendoQr}
              >
                <Text style={styles.botonQrTexto}>
                  {subiendoQr
                    ? "Subiendo..."
                    : qrUrl
                      ? "Cambiar código QR"
                      : "Subir código QR"}
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  loader: {
    marginVertical: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardResumen: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  filaMétrica: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valorMétrica: {
    fontSize: 14,
    fontWeight: "700",
  },
  qrContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  qrImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  botonQr: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  botonQrTexto: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
