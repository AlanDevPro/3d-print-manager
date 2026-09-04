// src/components/ui/parametros/DepreciacionSection.tsx
import { ImpresoraDepreciacion } from "@/features/parametros/types";
import React from "react";
import { ImpresoraDepreciacionCard } from "./ImpresoraDepreciacionCard";

interface DepreciacionSectionProps {
  impresoras: ImpresoraDepreciacion[];
  monedaPrincipal?: string; // 👈 Opcional para tolerar undefined
  tarifaElectricaKwh?: number;
}

export function DepreciacionSection({
  impresoras,
  monedaPrincipal = "BOB", // 👈 Fallback por defecto si viene undefined
  tarifaElectricaKwh,
}: DepreciacionSectionProps) {
  return (
    <>
      {impresoras.map((impresora) => (
        <ImpresoraDepreciacionCard
          key={impresora.id}
          impresora={impresora}
          monedaPrincipal={monedaPrincipal}
          tarifaElectricaKwh={tarifaElectricaKwh}
        />
      ))}
    </>
  );
}