// src/components/ui/CotizacionResumenCard.tsx

import { useEmpresaActual } from "@/context/EmpresaContext";
import { useFichaInternaPdf } from "@/features/cotizacion/hooks/useFichaInternaPdf";
import {
  buildVoucherPublicUrl,
  guardarVoucherPublico,
} from "@/features/cotizacion/services/voucherPublicoService";
import type { ResultadoCotizacion } from "@/features/cotizacion/types";
import { mapResultadoToFichaInterna } from "@/features/cotizacion/utils/mapResultadoToFichaInterna";
import { mapResultadoToVoucher } from "@/features/cotizacion/utils/mapResultadoToVoucher";
import { crearPedidoPendiente } from "@/features/pedidos/services/pedidosService";
import { useTheme } from "@/hooks/useTheme";
import { uriToBase64DataUri } from "@/utils/imageToBase64";
import { abrirWhatsappConEnlace } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export interface CotizacionResumenCardProps {
  resultado: ResultadoCotizacion | null;
  cantidad: number;
  especificaciones?: any;
  clienteId?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
  onGuardarCliente?: (cliente: {
    id?: string;
    nombre_razon_social: string;
    telefono: string;
  }) => Promise<string | { id?: string } | void>;
  onGuardarCotizacion?: (options?: {
    cliente_id?: string;
    imagenUri?: string | null;
  }) => Promise<any>;
}

const formatMoneda = (value?: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "0,00";
  return value.toFixed(2).replace(".", ",");
};

const formatTiempo = (horas?: number, minutos?: number): string => {
  const h = Math.floor(horas || 0);
  const m = Math.round(minutos || 0);
  if (h <= 0 && m <= 0) return "0min";
  if (h <= 0) return `${m}min`;
  if (m <= 0) return `${h}hrs`;
  return `${h}hrs ${m}min`;
};

function extraerId(valor: unknown): string | undefined {
  if (typeof valor === "string" && valor.trim() !== "") return valor;
  if (valor && typeof valor === "object" && "id" in (valor as any)) {
    const id = (valor as any).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
}

function esErrorTelefonoDuplicado(error: any): boolean {
  const mensaje: string =
    error?.message || (typeof error === "string" ? error : "");
  return (
    /ya está registrado/i.test(mensaje) || /ya pertenece a otro/i.test(mensaje)
  );
}

type TabId = "general" | string;

export function CotizacionResumenCard({
  resultado,
  cantidad = 1,
  especificaciones,
  clienteId,
  nombreCliente = "",
  telefonoCliente = "",
  onGuardarCliente,
  onGuardarCotizacion,
}: CotizacionResumenCardProps) {
  const { theme } = useTheme();
  const { empresa } = useEmpresaActual();

  const { descargarFichaInterna, generando: generandoFicha } =
    useFichaInternaPdf();

  const [generandoVoucher, setGenerandoVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [tabActivo, setTabActivo] = useState<TabId>("general");

  const moneda = "Bs";

  const tabs = useMemo(() => {
    const base = [{ id: "general" as TabId, label: "Cotización General" }];
    const piezaTabs = (resultado?.piezas ?? []).map((p, idx) => ({
      id: p.id as TabId,
      label: p.nombre_pieza?.trim() ? p.nombre_pieza : `Pieza ${idx + 1}`,
    }));
    return [...base, ...piezaTabs];
  }, [resultado]);

  useEffect(() => {
    if (!tabs.find((t) => t.id === tabActivo)) {
      setTabActivo("general");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs.length]);

  const piezaSeleccionada =
    tabActivo !== "general"
      ? resultado?.piezas.find((p) => p.id === tabActivo)
      : undefined;

  const esVistaGeneral = tabActivo === "general" || !piezaSeleccionada;

  const puedeEnviarVoucher = Boolean(resultado && telefonoCliente.trim());

  const handleVoucherCliente = async () => {
    if (generandoVoucher) return;
    if (!resultado) return;

    if (!telefonoCliente.trim()) {
      setVoucherError(
        "Ingresa el teléfono del cliente para poder enviar la cotización."
      );
      return;
    }

    try {
      setVoucherError(null);
      setGenerandoVoucher(true);

      let clienteIdResuelto: string | undefined = clienteId;
      let cotizacionIdResuelta: string | undefined;

      // 1. Guardar o resolver Cliente
      if (onGuardarCliente) {
        try {
          const resGuardar = await onGuardarCliente({
            id: clienteId,
            nombre_razon_social: nombreCliente,
            telefono: telefonoCliente,
          });
          clienteIdResuelto = extraerId(resGuardar) ?? clienteIdResuelto;
        } catch (errCliente: any) {
          const mensaje =
            errCliente?.message ||
            "El teléfono ya pertenece a otro cliente o hubo un error al registrarlo.";

          if (esErrorTelefonoDuplicado(errCliente)) {
            Alert.alert("Teléfono registrado a otro cliente", mensaje, [
              { text: "Corregir datos" },
            ]);
          } else {
            Alert.alert("No se pudo guardar el cliente", mensaje, [
              { text: "Entendido" },
            ]);
          }
          setVoucherError(mensaje);
          return;
        }
      }

      if (!clienteIdResuelto) {
        Alert.alert(
          "Cliente no identificado",
          "No se pudo vincular un cliente válido. Corrija la información e intente nuevamente."
        );
        setVoucherError(
          "No se pudo vincular un cliente válido. Corrija la información e intente nuevamente."
        );
        return;
      }

      // 2. Guardar Cotización incluyendo la URI de la Imagen de Referencia
      if (onGuardarCotizacion) {
        const resCotizacion = await onGuardarCotizacion({
          cliente_id: clienteIdResuelto,
          imagenUri: especificaciones?.imagenUri ?? null,
        });
        cotizacionIdResuelta = extraerId(resCotizacion);
      }

      if (!empresa?.id) {
        Alert.alert(
          "Empresa no seleccionada",
          "No se pudo identificar la empresa actual para registrar el pedido."
        );
        setVoucherError("Falta la configuración de la empresa actual.");
        return;
      }

      // 3. Crear Pedido Pendiente
      try {
        const descripcionPiezas = resultado.piezas
          .map((p) => `${p.nombre_pieza} x${p.cantidad}`)
          .join(", ");

        await crearPedidoPendiente({
          empresaId: empresa.id,
          clienteId: clienteIdResuelto,
          cotizacionId: cotizacionIdResuelta ?? null,
          piezaDescripcion: descripcionPiezas || "Pieza sin nombre",
          pagoTotal: resultado.precio_final ?? 0,
        });
      } catch (pedidoError: any) {
        Alert.alert(
          "Error al crear pedido",
          `No se pudo registrar el pedido en el sistema: ${
            pedidoError?.message ?? "Error en la base de datos."
          }`
        );
        return;
      }

      // 4. Preparación de assets e imágenes para el Voucher Público
      const logoBase64 = await uriToBase64DataUri(empresa?.logoUrl);
      const empresaConLogo = empresa
        ? { ...empresa, logoUrl: logoBase64 ?? empresa.logoUrl }
        : empresa;

      const productImageBase64 = especificaciones?.imagenUri
        ? await uriToBase64DataUri(especificaciones.imagenUri)
        : undefined;

      const especificacionesConImagen = especificaciones
        ? {
            ...especificaciones,
            imagenUri: productImageBase64 ?? especificaciones.imagenUri,
          }
        : especificaciones;

      const voucherData = mapResultadoToVoucher(resultado, {
        cantidad,
        especificaciones: especificacionesConImagen,
        empresa: empresaConLogo,
      });

      if (!cotizacionIdResuelta) {
        Alert.alert(
          "Cotización no guardada",
          "No se pudo vincular la cotización para publicar el voucher."
        );
        setVoucherError("Falta el ID de la cotización para publicar el voucher.");
        return;
      }

      // 5. Publicar voucher e iniciar WhatsApp
      const token = await guardarVoucherPublico(cotizacionIdResuelta, voucherData);
      const urlPublica = buildVoucherPublicUrl(token);
      const nombrePiezasResumen =
        resultado.piezas.length === 1
          ? resultado.piezas[0].nombre_pieza
          : `${resultado.piezas.length} piezas`;
      const mensaje = `Hola ${nombreCliente || ""}, aquí tienes tu cotización de "${
        nombrePiezasResumen || "tu pedido"
      }": ${urlPublica}`.trim();

      await abrirWhatsappConEnlace(telefonoCliente, mensaje);
    } catch (e: any) {
      const errorMessage =
        e?.message ||
        e?.error_description ||
        (typeof e === "string" ? e : JSON.stringify(e, null, 2));

      Alert.alert("Error General", `Ocurrió un inconveniente: ${errorMessage}`);
      setVoucherError(`Error al procesar: ${errorMessage}`);
    } finally {
      setGenerandoVoucher(false);
    }
  };

  const handleFichaInterna = async () => {
    if (!resultado || !especificaciones || generandoFicha) return;
    try {
      const productImageBase64 = especificaciones.imagenUri
        ? await uriToBase64DataUri(especificaciones.imagenUri)
        : undefined;

      const fichaData = mapResultadoToFichaInterna(resultado, {
        cantidad,
        especificaciones: {
          ...especificaciones,
          imagenUri: productImageBase64,
        },
      });

      await descargarFichaInterna(fichaData);
    } catch (e: any) {
      const errorMessage =
        e?.message || (typeof e === "string" ? e : JSON.stringify(e, null, 2));
      setVoucherError(`Error Ficha Interna: ${errorMessage}`);
      Alert.alert("Error al generar ficha interna", errorMessage);
    }
  };

  if (!resultado || !resultado.desglose || resultado.piezas.length === 0) {
    return (
      <View
        style={[
          styles.card,
          styles.emptyCard,
          { backgroundColor: theme.bgSurface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Ingresa los parámetros necesarios para calcular la cotización en
          tiempo real.
        </Text>
      </View>
    );
  }

  const { desglose } = resultado;
  const cantActualGeneral = resultado.cantidad || cantidad || 1;

  const matDirecto = esVistaGeneral
    ? desglose.costo_material ?? 0
    : piezaSeleccionada!.costo_material;
  const operacionMo = esVistaGeneral
    ? desglose.costo_mano_obra ?? 0
    : piezaSeleccionada!.costo_mano_obra;
  const depreciacion = esVistaGeneral
    ? desglose.costo_depreciacion ?? 0
    : piezaSeleccionada!.costo_depreciacion;
  const energia = esVistaGeneral
    ? desglose.costo_energia ?? 0
    : piezaSeleccionada!.costo_energia;

  const utilidadTotal = esVistaGeneral
    ? resultado.monto_ganancia ?? 0
    : piezaSeleccionada!.monto_ganancia_pieza;

  const cantActual = esVistaGeneral ? cantActualGeneral : piezaSeleccionada!.cantidad;

  const utilidadAMostrar = esVistaGeneral
    ? utilidadTotal
    : piezaSeleccionada!.monto_ganancia_pieza;

  const pctUtilidadAplicado = resultado.margen_ganancia_aplicado_pct ?? 0;
  const fondoRiesgo = esVistaGeneral
    ? desglose.costo_fallos ?? 0
    : piezaSeleccionada!.costo_fallos_pieza;
  const subtotalDirecto = matDirecto + operacionMo + depreciacion + energia;
  const costoBaseTotal = esVistaGeneral
    ? resultado.subtotal_costo_base ?? 0
    : piezaSeleccionada!.costo_base_pieza;

  const precioVentaMostrado = esVistaGeneral
    ? resultado.precio_final
    : piezaSeleccionada!.precio_total_pieza;

  const costSegments = [
    { key: "mat", label: "MATERIAL", flex: matDirecto || 0, color: "#1F2937" },
    { key: "ope", label: "OPERACIÓN", flex: operacionMo || 0, color: "#4B5563" },
    { key: "dep", label: "DEPRECIACIÓN", flex: depreciacion || 0, color: "#9CA3AF" },
    { key: "ene", label: "ENERGÍA", flex: energia || 0, color: "#D1D5DB" },
    { key: "uti", label: "UTILIDAD", flex: utilidadTotal || 0, color: theme.primary },
  ];

  const tituloPieza = esVistaGeneral
    ? `Cotización General (${resultado.piezas.length} ${
        resultado.piezas.length === 1 ? "pieza" : "piezas"
      })`
    : piezaSeleccionada!.nombre_pieza;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.bgSurface, borderColor: theme.border },
      ]}
    >
      {/* PESTAÑAS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => {
          const isSelected = tab.id === tabActivo;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setTabActivo(tab.id)}
              style={[
                styles.tabChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.bgPrimary,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabChipText,
                  {
                    color: isSelected ? "#FFFFFF" : theme.textPrimary,
                    fontWeight: isSelected ? "700" : "500",
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* CABECERA */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="calculator-outline" size={20} color={theme.primary} />
          <Text
            style={[styles.title, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {tituloPieza}
          </Text>
        </View>
        <Text
          style={[
            styles.badge,
            { backgroundColor: theme.primary + "1A", color: theme.primary },
          ]}
        >
          x{cantActual} {cantActual === 1 ? "unidad" : "unidades"}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* PRECIO DE VENTA */}
      <Text style={[styles.headerTitle, { color: theme.textSecondary }]}>
        {esVistaGeneral ? "PRECIO TOTAL (VENTA)" : "PRECIO SUGERIDO DE ESTA PIEZA (TOTAL)"}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.priceReadOnly, { color: theme.textPrimary }]}>
          {formatMoneda(precioVentaMostrado)}
        </Text>
        <Text style={[styles.currencySymbol, { color: theme.primary }]}>{moneda}</Text>
      </View>
      <Text style={[styles.subtextNotice, { color: theme.textSecondary }]}>
        {esVistaGeneral
          ? "Precio total de venta de todas las piezas de este proyecto."
          : "Precio sugerido de esta pieza según su proporción dentro del costo directo total del proyecto."}
      </Text>

      {/* BARRA Y LEYENDA VISUAL DE COSTOS */}
      <View style={styles.progressBar}>
        {costSegments.map((seg) => (
          <View
            key={seg.key}
            style={[
              styles.progressSegment,
              { flex: seg.flex > 0 ? seg.flex : 0.001, backgroundColor: seg.color },
            ]}
          />
        ))}
      </View>

      <View style={styles.legendContainer}>
        {costSegments.map((seg) => (
          <LegendItem
            key={seg.key}
            color={seg.color}
            label={seg.label}
            textColor={theme.textSecondary}
          />
        ))}
      </View>

      {/* TARJETAS DE PESO Y DURACIÓN */}
      {esVistaGeneral ? (
        <View style={styles.piezasResumenContainer}>
          <Text style={[styles.piezasResumenTitle, { color: theme.textSecondary }]}>
            DETALLE DE PIEZAS
          </Text>
          {resultado.piezas.map((p, idx) => (
            <View
              key={p.id}
              style={[
                styles.piezaCard,
                { backgroundColor: theme.bgPrimary, borderColor: theme.border },
              ]}
            >
              <Text
                style={[styles.piezaCardNombre, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {idx + 1}. {p.nombre_pieza}
              </Text>

              <View style={styles.piezaStatsRow}>
                {/* TARJETA PESO */}
                <View
                  style={[
                    styles.piezaStatCard,
                    { backgroundColor: theme.bgSurface, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.statHeaderRow}>
                    <Ionicons name="scale-outline" size={13} color={theme.textSecondary} />
                    <Text style={[styles.piezaStatLabel, { color: theme.textSecondary }]}>
                      Peso de Pieza
                    </Text>
                  </View>
                  <Text style={[styles.piezaStatValue, { color: theme.textPrimary }]}>
                    {p.peso_gramos}g
                  </Text>
                </View>

                {/* TARJETA DURACIÓN */}
                <View
                  style={[
                    styles.piezaStatCard,
                    { backgroundColor: theme.bgSurface, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.statHeaderRow}>
                    <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
                    <Text style={[styles.piezaStatLabel, { color: theme.textSecondary }]}>
                      Duración de Pieza
                    </Text>
                  </View>
                  <Text style={[styles.piezaStatValue, { color: theme.textPrimary }]}>
                    {formatTiempo(p.tiempo_impresion_horas, p.tiempo_impresion_minutos)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.statsRow}>
          {/* TARJETA PESO (PIEZA ÚNICA) */}
          <View style={[styles.statBox, { borderColor: theme.border, backgroundColor: theme.bgSurface }]}>
            <View style={styles.statHeaderRow}>
              <Ionicons name="scale-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Peso de Pieza</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {piezaSeleccionada!.peso_gramos}g
            </Text>
          </View>

          {/* TARJETA DURACIÓN (PIEZA ÚNICA) */}
          <View style={[styles.statBox, { borderColor: theme.border, backgroundColor: theme.bgSurface }]}>
            <View style={styles.statHeaderRow}>
              <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Duración de Pieza</Text>
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {formatTiempo(
                piezaSeleccionada!.tiempo_impresion_horas,
                piezaSeleccionada!.tiempo_impresion_minutos,
              )}
            </Text>
          </View>
        </View>
      )}

      {/* DESGLOSE DETALLADO */}
      <View style={styles.costDetails}>
        <DetailRow
          label="Material directo"
          value={matDirecto}
          moneda={moneda}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />
        <DetailRow
          label="Mano de obra / Preparación"
          value={operacionMo}
          moneda={moneda}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />
        <DetailRow
          label="Depreciación de máquina"
          value={depreciacion}
          moneda={moneda}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />
        <DetailRow
          label="Energía eléctrica"
          value={energia}
          moneda={moneda}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />

        <View style={[styles.subDivider, { backgroundColor: theme.border }]} />

        <DetailRow
          label="Subtotal directo"
          value={subtotalDirecto}
          moneda={moneda}
          bold
          textColor={theme.textPrimary}
          labelColor={theme.textPrimary}
        />
        <DetailRow
          label={esVistaGeneral ? "Fondo de riesgo / Fallos" : "Fondo de riesgo (prorrateado)"}
          value={fondoRiesgo}
          moneda={moneda}
          textColor={theme.textPrimary}
          labelColor={theme.textSecondary}
        />

        <View style={[styles.subDivider, { backgroundColor: theme.border }]} />

        <DetailRow
          label="Costo fabricación base (sin utilidad)"
          value={costoBaseTotal}
          moneda={moneda}
          bold
          textColor={theme.textPrimary}
          labelColor={theme.textPrimary}
        />

        {/* TARJETA DE UTILIDAD */}
        <View
          style={[
            styles.profitBox,
            { backgroundColor: theme.bgSurface, borderColor: theme.primary },
          ]}
        >
          <View style={styles.profitInfoContainer}>
            <Text style={[styles.profitLabel, { color: theme.primary }]}>
              {esVistaGeneral ? "Utilidad total del proyecto" : "Utilidad de esta pieza"}
            </Text>
            <Text style={[styles.profitSubtext, { color: theme.textSecondary }]}>
              {esVistaGeneral
                ? `Margen aplicado: ${pctUtilidadAplicado.toFixed(1)}%`
                : `Margen aplicado (Q=${cantActual}): ${pctUtilidadAplicado.toFixed(1)}%`}
            </Text>
          </View>
          <Text style={[styles.profitValue, { color: theme.primary }]}>
            + {formatMoneda(utilidadAMostrar)} {moneda}
          </Text>
        </View>

        {resultado.monto_impuesto > 0 && (
          <DetailRow
            label="Impuestos"
            value={resultado.monto_impuesto}
            moneda={moneda}
            textColor={theme.textPrimary}
            labelColor={theme.textSecondary}
          />
        )}
      </View>

      {/* ACCIONES */}
      <View style={styles.actionsRow}>
        <Pressable
          style={[
            styles.btnSecondary,
            { borderColor: theme.border, opacity: generandoFicha ? 0.7 : 1 },
          ]}
          onPress={handleFichaInterna}
          disabled={generandoFicha}
        >
          {generandoFicha ? (
            <ActivityIndicator color={theme.textPrimary} size="small" />
          ) : (
            <Text style={[styles.btnSecondaryText, { color: theme.textPrimary }]}>
              Ficha interna
            </Text>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.btnWhatsapp,
            { opacity: generandoVoucher || !puedeEnviarVoucher ? 0.6 : 1 },
          ]}
          onPress={handleVoucherCliente}
          disabled={generandoVoucher || !puedeEnviarVoucher}
        >
          {generandoVoucher ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
              <Text style={styles.btnPrimaryText}>Enviar por WhatsApp</Text>
            </>
          )}
        </Pressable>
      </View>

      {Boolean(voucherError) && (
        <Text style={[styles.voucherErrorText, { color: theme.danger }]}>
          {voucherError}
        </Text>
      )}
    </View>
  );
}

function LegendItem({
  color,
  label,
  textColor,
}: {
  color: string;
  label: string;
  textColor: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  moneda,
  bold,
  textColor,
  labelColor,
}: {
  label: string;
  value?: number;
  moneda: string;
  bold?: boolean;
  textColor: string;
  labelColor: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: labelColor }, bold && styles.textBold]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: textColor }, bold && styles.textBold]}>
        {formatMoneda(value)} {moneda}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, gap: 10 },
  emptyCard: { paddingVertical: 24, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 13, textAlign: "center" },
  tabsScrollView: { marginBottom: 2 },
  tabsContainer: { flexDirection: "row", gap: 8, alignItems: "center" },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 160,
  },
  tabChipText: { fontSize: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  title: { fontSize: 16, fontWeight: "700", flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
  headerTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  priceRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 2 },
  priceReadOnly: { fontSize: 24, fontWeight: "800" },
  currencySymbol: { fontSize: 16, fontWeight: "700", marginLeft: 6, marginBottom: 2 },
  subtextNotice: { fontSize: 11 },
  divider: { height: 1, marginVertical: 4 },
  progressBar: {
    height: 8,
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  progressSegment: { height: "100%" },
  legendContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center" },
  legendDot: { width: 8, height: 8, borderRadius: 2, marginRight: 4 },
  legendText: { fontSize: 9, fontWeight: "700" },

  statsRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  statHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: { fontSize: 10, fontWeight: "600" },
  statValue: { fontSize: 13, fontWeight: "700", marginTop: 2 },

  piezasResumenContainer: { marginTop: 10, gap: 8 },
  piezasResumenTitle: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6 },
  piezaCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  piezaCardNombre: { fontSize: 13, fontWeight: "700" },
  piezaStatsRow: { flexDirection: "row", gap: 8 },
  piezaStatCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  piezaStatLabel: { fontSize: 10, fontWeight: "600" },
  piezaStatValue: { fontSize: 13, fontWeight: "700", marginTop: 2 },

  costDetails: { marginTop: 6 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13 },
  textBold: { fontWeight: "700" },
  subDivider: { height: 1, marginVertical: 6 },
  profitBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  profitInfoContainer: { flex: 1 },
  profitLabel: { fontSize: 13, fontWeight: "700" },
  profitSubtext: { fontSize: 11, marginTop: 2 },
  profitValue: { fontSize: 15, fontWeight: "700", marginLeft: 8 },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: { fontWeight: "700", fontSize: 13 },
  btnWhatsapp: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#25D366",
    borderRadius: 8,
    paddingVertical: 12,
  },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  voucherErrorText: { fontSize: 11, fontWeight: "500", textAlign: "center", marginTop: 4 },
});