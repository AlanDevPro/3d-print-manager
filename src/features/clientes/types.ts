// @/features/clientes/types.ts

// Modelo UI (camelCase)
export interface Cliente {
  id: string;
  empresaId: string;
  userId?: string | null;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

// Resumen para componentes ligeros
export interface ClienteResumen {
  id: string;
  nombre: string;
  telefono?: string;
  userId?: string | null;
}

// Payload para creación
export interface ClienteInsertInput {
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
  notas?: string | null;
  userId?: string | null;
}

export type ClienteUpdateInput = Partial<ClienteInsertInput>;

export interface ClienteFormState {
  nombre: string;
  telefono: string;
  direccion: string;
  notas: string;
}
