//src/features/finanzas/components/RankingProductosCard.tsx
import { RankingItem } from "@/components/ui/RankingItem";
import { SeccionBloque } from "@/components/ui/SeccionBloque";
import React from "react";
import { ClienteStatsUI } from "../types";

interface Props {
  theme: any;
  clientes: ClienteStatsUI[];
}

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export function RankingClientesCard({ theme, clientes }: Props) {
  return (
    <SeccionBloque
      titulo="Clientes que más compran"
      icono="people-outline"
      theme={theme}
    >
      {clientes.map((c) => (
        <RankingItem
          key={c.clienteId}
          theme={theme}
          iniciales={iniciales(c.nombre)}
          nombre={c.nombre}
          monto={c.totalPagado}
        />
      ))}
    </SeccionBloque>
  );
}
