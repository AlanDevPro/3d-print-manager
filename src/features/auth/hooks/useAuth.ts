// src/features/auth/hooks/useAuth.ts
import { AuthContext } from "@/context/AuthContext";
import { registrarPushToken } from "@/features/pedidos/services/pushNotificationsService";
import { useContext } from "react";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }

  /**
   * Helper opcional para registrar el Push Token del usuario tras la autenticación.
   * Llama a esta función inmediatamente después de realizar un login exitoso.
   */
  const vincularPushToken = async (userId: string, empresaId: string) => {
    try {
      await registrarPushToken(userId, empresaId);
    } catch (error) {
      console.warn("⚠️ No se pudo registrar el token push:", error);
    }
  };

  return {
    ...context,
    vincularPushToken,
  };
};