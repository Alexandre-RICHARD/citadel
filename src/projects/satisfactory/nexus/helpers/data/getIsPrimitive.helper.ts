export const getIsPrimitiveHelper = (variable: unknown) =>
  variable === null ||
  (typeof variable !== "object" && typeof variable !== "function");
