export const ITEM_STATUS = {
  AVAILABLE: "AVAILABLE",
  LOANED: "LOANED",
  RESERVED: "RESERVED",
  DAMAGED: "DAMAGED",
  LOST: "LOST",
};

// Opciones al cerrar un préstamo: lo que elige el bibliotecario es el nuevo estado del ejemplar.
export const RETURN_CONDITIONS = [
  { value: ITEM_STATUS.AVAILABLE, label: "Devuelto" },
  { value: ITEM_STATUS.DAMAGED, label: "Dañado" },
  { value: ITEM_STATUS.LOST, label: "Perdido" },
];