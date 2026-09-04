import { supabase } from "@/config/supabase";
import * as Crypto from "expo-crypto";
import type { VoucherData } from "../types";

export async function guardarVoucherPublico(
  cotizacionId: string,
  voucherData: VoucherData,
): Promise<string> {
  const token = Crypto.randomUUID();

  const { error } = await supabase
    .from("cotizaciones")
    .update({ 
      voucher_data: voucherData, 
      token_publico: token 
    })
    .eq("id", cotizacionId);

  if (error) {
    throw new Error(`No se pudo publicar el voucher: ${error.message}`);
  }

  return token;
}

export function buildVoucherPublicUrl(token: string): string {
  const baseUrl = "https://cotizador-3d-web.vercel.app";

  return `${baseUrl}/v/${token}`;
}