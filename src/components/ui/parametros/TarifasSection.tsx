import { ParametroCampoNumero } from "@/components/ui/ParametroCampo";
import {
  EspecificacionMaquina,
  ImpresoraDepreciacion,
  TarifasMoneda,
} from "@/features/parametros/types";
import React from "react";
import { EspecificacionesMaquinaCard } from "./EspecificacionesMaquinaCard";
import { MonedaSelector } from "./MonedaSelector";
import { ReglasMargenCard } from "./ReglasMargenCard";

interface TarifasSectionProps {
  tarifas: TarifasMoneda;
  impresoras?: (EspecificacionMaquina | ImpresoraDepreciacion)[];
  empresaId?: string | null;
  userId?: string | null;
  onChange: (cambios: Partial<TarifasMoneda>) => void;
}

export function TarifasSection({
  tarifas,
  impresoras = [],
  empresaId,
  userId,
  onChange,
}: TarifasSectionProps) {
  const activeEntityId = empresaId ?? userId ?? undefined;

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

      <EspecificacionesMaquinaCard impresoras={impresoras} />
    </>
  );
}