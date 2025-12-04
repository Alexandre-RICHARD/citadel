export const roundNumber = (
  number: number,
  decimal: number,
  roundType?: "ceil" | "floor",
): number => {
  if (!roundType) return parseFloat(number.toFixed(decimal));
  const factor = 10 ** decimal;
  const roundedNumber = Math[roundType](number * factor) / factor;
  return parseFloat(roundedNumber.toFixed(decimal));
};
