// src/app/(tabs)/cotizar.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
ActivityIndicator,
ScrollView,
StyleSheet,
Text,
View,
} from "react-native";

import { useClientes } from "@/features/clientes/hooks/useClientes";
import { CotizacionResumenCard } from "@/features/cotizacion/components/CotizacionResumenCard";
import { EnviarWhatsappButton } from "@/features/cotizacion/components/EnviarWhatsappButton";
import { CotizacionForm } from "@/features/cotizacion/components/forms/CotizacionForm";
import { ClienteInfoSection } from "@/features/cotizacion/components/forms/sections/ClienteInfoSection";
import { useAutoCalculoCotizacion } from "@/features/cotizacion/hooks/useAutoCalculoCotizacion";
import { useCotizacion } from "@/features/cotizacion/hooks/useCotizacion";
import { useEnviarVoucherCliente } from "@/features/cotizacion/hooks/useEnviarVoucherCliente";
import { useValidacionSecuencial } from "@/features/cotizacion/hooks/useValidacionSecuencial";
import { buildEspecificaciones } from "@/features/cotizacion/utils/buildEspecificaciones";
import { Filamento, Impresora } from "@/features/materiales/types";
import { useTheme } from "@/hooks/useTheme";

export default function CotizarScreen() {
const { theme } = useTheme();

const cotizacion = useCotizacion();
const { guardarCliente, recargar: recargarClientes } = useClientes();

const [esPersonalizado, setEsPersonalizado] = useState<boolean>(
() => Number(cotizacion.form.precio_personalizacion) > 0,
);

useFocusEffect(
useCallback(() => {
cotizacion.recargarTaller?.();
recargarClientes?.();
}, [cotizacion.recargarTaller, recargarClientes]),
);

const filamentosList = cotizacion.filamentos as unknown as Filamento[];
const impresorasList = cotizacion.impresoras as unknown as Impresora[];

/_ ---------------- VALIDACIÓN SECUENCIAL EN TIEMPO REAL ---------------- _/
const validacion = useValidacionSecuencial({
form: cotizacion.form,
piezas: cotizacion.piezas,
materiales: filamentosList as any,
impresoras: impresorasList as any,
reglasMargen: (cotizacion.reglasMargen ?? []) as any,
esPersonalizado,
});

/_ ---------------- MOTOR DE CÁLCULO EN TIEMPO REAL ---------------- _/
useAutoCalculoCotizacion({
habilitado: validacion.todoValido,
form: cotizacion.form,
piezas: cotizacion.piezas,
calcular: cotizacion.calcular,
});

const especificaciones = useMemo(
() =>
buildEspecificaciones(
cotizacion.form,
filamentosList as any,
impresorasList as any,
),
[cotizacion.form, filamentosList, impresorasList],
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

const handleGuardarCotizacion = async (options?: { cliente_id?: string }) => {
if (!validacion.todoValido) return null;
return cotizacion.guardar(options);
};

/_ ---------------- ENVÍO DE VOUCHER POR WHATSAPP ---------------- _/
const { enviar: handleEnviarWhatsapp } = useEnviarVoucherCliente({
resultado: cotizacion.resultado,
cantidad: validacion.cantidadTotal,
especificaciones,
clienteId: cotizacion.form.cliente_id,
nombreCliente: cotizacion.form.nombre_cliente,
telefonoCliente: cotizacion.form.telefono_cliente,
onGuardarCliente: handleGuardarCliente,
onGuardarCotizacion: handleGuardarCotizacion,
});

const resultadoListo =
Boolean(cotizacion.resultado?.desglose) &&
(cotizacion.resultado?.piezas?.length ?? 0) > 0;

const puedeEnviar =
validacion.todoValido && validacion.clienteValido && resultadoListo;

const motivoDeshabilitado = !validacion.todoValido
? "Completa los 6 pasos de la cotización para habilitar el envío."
: !resultadoListo
? "Espera a que termine el cálculo de la cotización."
: !validacion.clienteValido
? "Completa el nombre y el teléfono del cliente."
: undefined;

return (
<ScrollView
style={[styles.container, { backgroundColor: theme.bgPrimary }]}
contentContainerStyle={styles.contentContainer}
showsVerticalScrollIndicator={false}
keyboardShouldPersistTaps="handled" >
{/_ ------------------ FORMULARIO SECUENCIAL (1 a 6) ------------------ _/}
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
reglasMargen={cotizacion.reglasMargen as any}
cargandoDatos={cotizacion.cargandoDatos}
calculando={cotizacion.calculando}
error={cotizacion.error}
validacion={validacion}
esPersonalizado={esPersonalizado}
onTogglePersonalizado={setEsPersonalizado}
/>

      {/* ------------------ RESUMEN ------------------ */}
      <View style={styles.resumenContainer}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="receipt-outline" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Resumen de Cotización
          </Text>
        </View>

        {!validacion.todoValido ? (
          <View
            style={[
              styles.placeholderCard,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={26}
              color={theme.textSecondary}
            />
            <Text
              style={[styles.placeholderTitle, { color: theme.textPrimary }]}
            >
              Resumen aún no disponible
            </Text>
            <Text
              style={[styles.placeholderDesc, { color: theme.textSecondary }]}
            >
              El precio se calculará automáticamente cuando completes los 6
              pasos del formulario, incluyendo la selección del filamento y la
              impresora.
            </Text>
          </View>
        ) : !resultadoListo ? (
          <View
            style={[
              styles.placeholderCard,
              { backgroundColor: theme.bgSurface, borderColor: theme.border },
            ]}
          >
            <ActivityIndicator size="small" color={theme.primary} />
            <Text
              style={[styles.placeholderTitle, { color: theme.textPrimary }]}
            >
              Calculando cotización...
            </Text>
            <Text
              style={[styles.placeholderDesc, { color: theme.textSecondary }]}
            >
              Procesando material, energía, depreciación, mano de obra, riesgo y
              utilidad.
            </Text>
          </View>
        ) : (
          <CotizacionResumenCard
            resultado={cotizacion.resultado}
            cantidad={validacion.cantidadTotal}
            especificaciones={especificaciones}
            clienteId={cotizacion.form.cliente_id}
            nombreCliente={cotizacion.form.nombre_cliente}
            telefonoCliente={cotizacion.form.telefono_cliente}
            onGuardarCliente={handleGuardarCliente}
            onGuardarCotizacion={handleGuardarCotizacion}
          />
        )}
      </View>

      {/* ------------------ DATOS DEL CLIENTE ------------------ */}
      <View style={styles.clienteContainer}>
        <ClienteInfoSection
          clientes={cotizacion.clientes}
          clienteId={cotizacion.form.cliente_id}
          nombreCliente={cotizacion.form.nombre_cliente}
          telefonoCliente={cotizacion.form.telefono_cliente}
          onSeleccionarCliente={(c) => {
            cotizacion.updateField("cliente_id", c.id);
            cotizacion.updateField("nombre_cliente", c.nombre);
            if (c.telefono)
              cotizacion.updateField("telefono_cliente", c.telefono);
          }}
          onChangeNombre={(v) => cotizacion.updateField("nombre_cliente", v)}
          onChangeTelefono={(v) =>
            cotizacion.updateField("telefono_cliente", v)
          }
          errores={validacion.erroresCliente}
          completo={validacion.clienteValido}
        />

        {/* ------------------ ENVIAR POR WHATSAPP ------------------ */}
        <EnviarWhatsappButton
          habilitado={puedeEnviar}
          motivoDeshabilitado={motivoDeshabilitado}
          onEnviar={handleEnviarWhatsapp}
        />
      </View>
    </ScrollView>

);
}

const styles = StyleSheet.create({
container: { flex: 1 },
contentContainer: { paddingBottom: 60 },
resumenContainer: { paddingHorizontal: 16, marginTop: 12, gap: 12 },
clienteContainer: { paddingHorizontal: 16, marginTop: 18 },
headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
sectionTitle: { fontSize: 16, fontWeight: "700" },
placeholderCard: {
borderWidth: 1,
borderStyle: "dashed",
borderRadius: 12,
padding: 20,
alignItems: "center",
gap: 8,
},
placeholderTitle: { fontSize: 14, fontWeight: "700" },
placeholderDesc: {
fontSize: 12.5,
lineHeight: 18,
textAlign: "center",
},
});
