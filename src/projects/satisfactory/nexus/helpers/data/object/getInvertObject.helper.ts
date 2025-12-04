export const getInvertObject = (
  originalObject: Record<string, string>,
): Record<string, string> => {
  return Object.entries(originalObject).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [value]: key,
    }),
    {} as Record<string, string>,
  );
};
