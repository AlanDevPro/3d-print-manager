// src/features/cotizacion/types/formTypes.ts
export type MaterialItem = {
  id: string;
  material?: string;
  nombre?: string;
  tipo_material?: string;
  color?: string;
};

export type ReglaMargen = {
  id: string;
  nombre: string;
  margen_ganancia_pct: number;
  es_predeterminado?: boolean;
};

export type PiezaFormState = {
  id: string;
  nombre_pieza: string;
  peso_gramos: string;
  cantidad: string;
  tiempo_impresion_horas: string;
  tiempo_impresion_minutos: string;
};