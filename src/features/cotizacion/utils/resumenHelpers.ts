// src/features/cotizacion/utils/resumenHelpers.ts
export function extraerId(valor: unknown): string | undefined {
  if (typeof valor === "string" && valor.trim() !== "") return valor;
  if (valor && typeof valor === "object" && "id" in (valor as any)) {
    const id = (valor as any).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
}

export function esErrorTelefonoDuplicado(error: any): boolean {
  const mensaje: string = error?.message || (typeof error === "string" ? error : "");
  return /ya está registrado/i.test(mensaje) || /ya pertenece a otro/i.test(mensaje);
}