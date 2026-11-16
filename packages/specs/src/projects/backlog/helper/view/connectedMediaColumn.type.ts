import type { MediaColumnEnum } from "../../enum/mediaColumn.enum.ts";
import type { NasColumnEnum } from "../../enum/nasColumn.enum.ts";

// Les colonnes du tableau des films et séries en mode connecté : celles des deux modes, puis celles du NAS (§5)
export type ConnectedMediaColumn = MediaColumnEnum | NasColumnEnum;
