import { ConfiguracionTallerProvider } from "@/context/ConfiguracionTallerContext";
import { EmpresaProvider } from "@/context/EmpresaContext";
import React from "react";

export function AppDataProvider({
  userId,
  children,
}: {
  userId: string | null;
  children: React.ReactNode;
}) {
  return (
    <EmpresaProvider userId={userId}>
      <ConfiguracionTallerProvider userId={userId}>
        {/* cuando tengas Catalogo/Inventario, van aquí anidados igual */}
        {children}
      </ConfiguracionTallerProvider>
    </EmpresaProvider>
  );
}
