//src/features/finanzas/components/RankingProductosCard.tsx
import { RankingItem } from "@/components/ui/RankingItem";
import { SeccionBloque } from "@/components/ui/SeccionBloque";
import React from "react";
import { ProductoRentabilidadUI } from "../types";

interface Props {
  theme: any;
  productos: ProductoRentabilidadUI[];
}

export function RankingProductosCard({ theme, productos }: Props) {
  return (
    <SeccionBloque
      titulo="Productos más rentables"
      icono="cube-outline"
      theme={theme}
    >
      {productos.map((p, idx) => (
        <RankingItem
          key={p.productoId}
          theme={theme}
          posicion={idx}
          destacadoPrimero
          nombre={p.nombre}
          subtitulo={`${p.unidadesVendidas} venta${p.unidadesVendidas !== 1 ? "s" : ""}`}
          monto={p.totalGenerado}
        />
      ))}
    </SeccionBloque>
  );
}
