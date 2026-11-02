import { MAIL_COLORS } from "../palette/mailColors.ts";
import { fontStyle } from "./fontStyle.ts";

// Les petites étiquettes en capitales espacées : « Message », « Nom », « Email »
export const LABEL_STYLE = `${fontStyle({ size: 11, weight: 700, lineHeight: 1.4, color: MAIL_COLORS.light.subtle })}letter-spacing:0.14em;text-transform:uppercase;`;
