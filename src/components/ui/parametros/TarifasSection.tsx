// src/features/parametros/components/TarifasSection.tsx

import React from "react";
import { ParametroCampoNumero } from "@/components/ui/ParametroCampo";
import { EspecificacionMaquina, TarifasMoneda } from "@/features/parametros/types";
import { useConfiguracionTaller } from "@/context/ConfiguracionTallerContext";
import { EspecificacionesMaquinaCard } from "./EspecificacionesMaquinaCard";
import { MonedaSelector } from "./MonedaSelector";
import { ReglasMargenCard } from "./ReglasMargenCard";

interface TarifasSectionProps {
  tarifas: TarifasMoneda;
  empresaId?: string | null;
  userId?: string | null;
  impresoras?: EspecificacionMaquina[]; // 👈 1. Agregado para corregir ts(2322)
  onChange: (cambios: Partial<TarifasMoneda>) => void;
}

export function TarifasSection({
  tarifas,
  empresaId,
  userId,
  impresoras, // 👈 2. Recibir prop
  onChange,
}: TarifasSectionProps) {
  const activeEntityId = empresaId ?? userId ?? undefined;
  
  // Reactividad desde el contexto
  const { impresorasRaw } = useConfiguracionTaller();

  // 🟢 Enfoque Híbrido: Prioriza impresoras pasadas por prop (si existen y tienen datos)
  // o cae en el fallback reactivo en tiempo real del Contexto
  const impresorasEfectivas = 
    (impresoras && impresoras.length > 0) ? impresoras : (impresorasRaw ?? []);

  return (
    <>
      <MonedaSelector
        value={tarifas.monedaPrincipal ?? null}
        onChange={(monedaPrincipal) => onChange({ monedaPrincipal })}
      />

      <ParametroCampoNumero
        label="Tarifa Eléctrica"
        value={tarifas.tarifaElectricaKwh ?? 0}
        onChange={(tarifaElectricaKwh) =>
          onChange({ tarifaElectricaKwh: tarifaElectricaKwh ?? 0 })
        }
        sufijo="/kWh"
      />

      <ReglasMargenCard
        reglas={tarifas.reglasMargen ?? []}
        userId={activeEntityId}
        onReglasChange={(reglasMargen) => onChange({ reglasMargen })}
      />

      {/* Renderiza utilizando la lista reactiva/híbrida efectiva */}
      <EspecificacionesMaquinaCard impresoras={impresorasEfectivas} />
    </>
  );
}