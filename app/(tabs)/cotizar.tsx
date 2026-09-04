import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CotizacionForm } from "@/features/cotizacion/components/forms/CotizacionForm";
import { CotizacionResumenCard } from "@/features/cotizacion/components/CotizacionResumenCard";
import { useClientes } from "@/features/clientes/hooks/useClientes";
import { useCotizacion } from "@/features/cotizacion/hooks/useCotizacion";
import { buildEspecificaciones } from "@/features/cotizacion/utils/buildEspecificaciones";
import { Filamento, Impresora } from "@/features/materiales/types";
import { useTheme } from "@/hooks/useTheme";

export default function CotizarScreen() {
  const { theme } = useTheme();

  const cotizacion = useCotizacion();
  const { guardarCliente } = useClientes();

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

  // "cantidad" ya no vive en CotizarFormState: ahora es por pieza (PiezaFormState).
  // Sumamos la cantidad de todas las piezas para el total del proyecto.
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
        // ⚠️ Pendiente: CotizacionForm (versión revisada antes) maneja "piezas"
        // con useState INTERNO y su Props no declara estas keys todavía.
        // Estas props solo compilarán/servirán una vez decidas mover el manejo
        // de piezas al hook useCotizacion y actualices CotizacionFormProps
        // para aceptarlas (quedó pendiente tu confirmación de esto).
        piezas={cotizacion.piezas}
        piezaActivaId={cotizacion.piezaActivaId}
        updatePiezaField={cotizacion.updatePiezaField}
        agregarPieza={cotizacion.agregarPieza}
        eliminarPieza={cotizacion.eliminarPieza}
        seleccionarPieza={cotizacion.seleccionarPieza}
        // Datos de catálogo
        impresoras={impresorasList as any}
        materiales={filamentosList as any}
        clientes={cotizacion.clientes}
        reglasMargen={cotizacion.reglasMargen as any}
        // Estados de carga y callbacks
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