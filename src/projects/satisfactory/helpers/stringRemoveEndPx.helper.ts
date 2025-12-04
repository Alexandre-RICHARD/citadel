export const stringRemoveEndPxHelper = (string: string): number => {
  return parseInt(string.split("px")[0], 10);
};
