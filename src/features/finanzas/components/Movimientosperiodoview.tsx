import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { DiaMesModal } from "@/features/finanzas/components/Diamesmodal";
import { ListaMovimientos } from "@/features/finanzas/components/ListaMovimientos";
import { MonthIconSelector } from "@/features/finanzas/components/Monthiconselector";
import { PaginacionNumerica } from "@/features/finanzas/components/Paginacionnumerica";
import { WeekDaySelector } from "@/features/finanzas/components/Weekdayselector";
import { EgresoUI, IngresoUI, Periodo } from "../types";

import { useMovimientosPorMes } from "../hooks/Usemovimientospormes";
import { usePaginacion } from "../hooks/Usepaginacion";

import { diaDelMesDeFecha, esMismaFechaIso } from "../utils/fechasComparacion";
import {
    MesInfo,
    obtenerMeses,
    obtenerMesPorDefecto,
} from "../utils/fechasMes";
import { obtenerDiaPorDefecto, obtenerDiasSemana } from "../utils/fechasSemana";

interface Props {
  theme: any;
  tipo: "ingreso" | "egreso";
  periodo: Periodo;
  /** Ingresos/egresos ya cargados para la semana actual (vienen de useFinanzasResumen("semana")). */
  movimientosSemanaActual: (IngresoUI | EgresoUI)[];
  cargandoSemana: boolean;
}

const MESES_POR_PAGINA = 6;
const POR_PAGINA = 10;

export function MovimientosPeriodoView({
  theme,
  tipo,
  periodo,
  movimientosSemanaActual,
  cargandoSemana,
}: Props) {
  // ---------- modo "semana": lun-dom + día seleccionado ----------
  const diasSemana = useMemo(() => obtenerDiasSemana(), []);
  const [diaSeleccionado, setDiaSeleccionado] = useState(() =>
    obtenerDiaPorDefecto(diasSemana),
  );

  const movimientosDelDia = useMemo(
    () =>
      movimientosSemanaActual.filter((m) =>
        esMismaFechaIso(m.fecha, diaSeleccionado),
      ),
    [movimientosSemanaActual, diaSeleccionado],
  );

  // ---------- modo "mes": 6 íconos de calendario + filtro opcional por día ----------
  const [retrocesoMeses, setRetrocesoMeses] = useState(0);
  const meses = useMemo(
    () => obtenerMeses(MESES_POR_PAGINA, retrocesoMeses),
    [retrocesoMeses],
  );

  const [mesSeleccionadoKey, setMesSeleccionadoKey] = useState(() =>
    obtenerMesPorDefecto(meses),
  );
  const mesSeleccionado =
    meses.find((m) => m.key === mesSeleccionadoKey) ?? meses[meses.length - 1];

  const [diaFiltradoDelMes, setDiaFiltradoDelMes] = useState<
    number | undefined
  >();
  const [modalVisible, setModalVisible] = useState(false);

  const { movimientos: movimientosDelMes, loading: cargandoMes } =
    useMovimientosPorMes(tipo, mesSeleccionado.anio, mesSeleccionado.mes);

  const movimientosMesFiltrados = useMemo(() => {
    if (!diaFiltradoDelMes) return movimientosDelMes;
    return movimientosDelMes.filter(
      (m) => diaDelMesDeFecha(m.fecha) === diaFiltradoDelMes,
    );
  }, [movimientosDelMes, diaFiltradoDelMes]);

  function seleccionarMes(mes: MesInfo) {
    setMesSeleccionadoKey(mes.key);
    setDiaFiltradoDelMes(undefined);
    setModalVisible(true);
  }

  // ---------- lista + paginación según el modo activo ----------
  const listaActiva =
    periodo === "semana" ? movimientosDelDia : movimientosMesFiltrados;
  const cargandoLista = periodo === "semana" ? cargandoSemana : cargandoMes;

  const { pagina, totalPaginas, itemsPagina, irAPagina } = usePaginacion(
    listaActiva,
    {
      porPagina: POR_PAGINA,
      resetKey:
        periodo === "semana"
          ? diaSeleccionado
          : `${mesSeleccionadoKey}-${diaFiltradoDelMes ?? "todo"}`,
    },
  );

  return (
    <View style={{ gap: 14 }}>
      {periodo === "semana" ? (
        <WeekDaySelector
          theme={theme}
          dias={diasSemana}
          diaSeleccionado={diaSeleccionado}
          onSeleccionar={setDiaSeleccionado}
        />
      ) : (
        <>
          <MonthIconSelector
            theme={theme}
            meses={meses}
            mesSeleccionado={mesSeleccionadoKey}
            onSeleccionar={seleccionarMes}
            onVerMasAntiguos={() =>
              setRetrocesoMeses((r) => r + MESES_POR_PAGINA)
            }
          />
          {diaFiltradoDelMes && (
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
              Mostrando el día {diaFiltradoDelMes} de{" "}
              {mesSeleccionado.etiquetaCompleta}
            </Text>
          )}
        </>
      )}

      {cargandoLista ? (
        <View style={styles.centrado}>
          <ActivityIndicator color={theme.textSecondary} />
        </View>
      ) : listaActiva.length === 0 ? (
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 13,
            textAlign: "center",
            paddingVertical: 12,
          }}
        >
          No hay {tipo === "ingreso" ? "ingresos" : "egresos"} registrados en
          este período.
        </Text>
      ) : (
        <>
          <ListaMovimientos
            theme={theme}
            tipo={tipo}
            movimientos={itemsPagina}
          />
          <PaginacionNumerica
            theme={theme}
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            onCambiar={irAPagina}
          />
        </>
      )}

      {periodo === "mes" && (
        <DiaMesModal
          theme={theme}
          visible={modalVisible}
          mes={mesSeleccionado}
          diaSeleccionado={diaFiltradoDelMes}
          onSeleccionarDia={(dia) => {
            setDiaFiltradoDelMes(dia);
            setModalVisible(false);
          }}
          onVerTodoElMes={() => {
            setDiaFiltradoDelMes(undefined);
            setModalVisible(false);
          }}
          onCerrar={() => setModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centrado: { paddingVertical: 24, alignItems: "center" },
});
