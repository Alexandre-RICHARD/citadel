export const getTextSizeHelper = (
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight = "normal",
) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context!.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = context!.measureText(text);
  return metrics.width;
};
