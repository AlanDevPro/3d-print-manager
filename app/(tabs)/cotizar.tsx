// src/app/(tabs)/cotizar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useClientes } from "@/features/clientes/hooks/useClientes";
import { CotizacionResumenCard } from "@/features/cotizacion/components/CotizacionResumenCard";
import { CotizacionForm } from "@/features/cotizacion/components/forms/CotizacionForm";
import { useCotizacion } from "@/features/cotizacion/hooks/useCotizacion";
import { buildEspecificaciones } from "@/features/cotizacion/utils/buildEspecificaciones";
import { Filamento, Impresora } from "@/features/materiales/types";
import { useTheme } from "@/hooks/useTheme";

export default function CotizarScreen() {
  const { theme } = useTheme();

  const cotizacion = useCotizacion();
  const { guardarCliente, recargar: recargarClientes } = useClientes();

  useFocusEffect(
    useCallback(() => {
      cotizacion.recargarTaller?.();
      recargarClientes?.();
    }, [cotizacion.recargarTaller, recargarClientes])
  );

  const filamentosList = cotizacion.filamentos as unknown as Filamento[];
  const impresorasList = cotizacion.impresoras as unknown as Impresora[];

  const especificaciones = useMemo(
    () =>
      buildEspecificaciones(
        cotizacion.form,
        filamentosList as any,
        impresorasList as any,
      ),
    [cotizacion.form, filamentosList, impresorasList],
  );

  const cantidadTotal = useMemo(
    () =>
      (cotizacion.piezas ?? []).reduce(
        (acc, p) => acc + (Number(p.cantidad) || 0),
        0,
      ) || 1,
    [cotizacion.piezas],
  );

  const handleGuardarCliente = async (cliente: {
    id?: string;
    nombre_razon_social: string;
    telefono: string;
  }) => {
    return guardarCliente({
      id: cliente.id,
      nombre: cliente.nombre_razon_social,
      telefono: cliente.telefono,
    });
  };

  const handleGuardarCotizacion = async (options?: {
    cliente_id?: string;
  }) => {
    const res = await cotizacion.guardar(options);
    return res;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bgPrimary }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <CotizacionForm
        form={cotizacion.form}
        updateField={cotizacion.updateField}
        piezas={cotizacion.piezas}
        piezaActivaId={cotizacion.piezaActivaId}
        updatePiezaField={cotizacion.updatePiezaField}
        agregarPieza={cotizacion.agregarPieza}
        eliminarPieza={cotizacion.eliminarPieza}
        seleccionarPieza={cotizacion.seleccionarPieza}
        impresoras={impresorasList as any}
        materiales={filamentosList as any}
        clientes={cotizacion.clientes}
        reglasMargen={cotizacion.reglasMargen as any}
        cargandoDatos={cotizacion.cargandoDatos}
        calculando={cotizacion.calculando}
        error={cotizacion.error}
        calcular={cotizacion.calcular}
      />

      <View style={styles.resumenContainer}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="receipt-outline" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Resumen de Cotización
          </Text>
        </View>

        <CotizacionResumenCard
          resultado={cotizacion.resultado}
          cantidad={cantidadTotal}
          especificaciones={especificaciones}
          clienteId={cotizacion.form.cliente_id}
          nombreCliente={cotizacion.form.nombre_cliente}
          telefonoCliente={cotizacion.form.telefono_cliente}
          onGuardarCliente={handleGuardarCliente}
          onGuardarCotizacion={handleGuardarCotizacion}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  resumenContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
});