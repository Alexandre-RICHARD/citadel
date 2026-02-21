export function formatNumberWithSpaces(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value).replace(/\u202f/g, " ");
}
