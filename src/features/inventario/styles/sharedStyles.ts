// src/features/inventario/styles/sharedStyles.ts
// Estilos reutilizados por más de un componente de Inventario (cards, modales, barras).
import { StyleSheet } from "react-native";

export const sharedStyles = StyleSheet.create({
  card: { borderRadius: 16, padding: 14, gap: 10 },
  filaTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitulo: { fontSize: 14.5, fontWeight: "700" },
  cardSubtitulo: { fontSize: 12, marginTop: 1 },

  barraFondo: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#00000014",
    overflow: "hidden",
  },
  barraRelleno: { height: 7, borderRadius: 4 },

  filaInfo: { flexDirection: "row", justifyContent: "space-between" },
  filaInfoTexto: { fontSize: 12, fontWeight: "600" },

  estadoBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  estadoBadgeTexto: { fontSize: 11, fontWeight: "700" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "88%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00000022",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  modalTitulo: { fontSize: 18, fontWeight: "800" },
  modalSub: { fontSize: 12.5, marginTop: 2 },

  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
  },
  detalleItem: { width: "47%", borderRadius: 12, padding: 10, gap: 4 },
  detalleLabel: { fontSize: 11 },
  detalleValor: { fontSize: 15, fontWeight: "700" },

  checklistTitulo: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 14,
  },

  cerrarBtn: { alignItems: "center", paddingVertical: 14 },
  cerrarBtnTexto: { fontSize: 13, fontWeight: "600" },
});
