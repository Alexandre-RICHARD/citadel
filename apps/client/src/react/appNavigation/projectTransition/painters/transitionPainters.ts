import { TransitionEffectEnum } from "../transitionEffect.enum";
import { createFirePainter } from "./createFirePainter";
import { createHexesPainter } from "./createHexesPainter";
import { createHexPainter } from "./createHexPainter";
import { createTilesPainter } from "./createTilesPainter";
import { createTramPainter } from "./createTramPainter";
import type { TransitionPainter } from "./transitionPainter.type";
import type { TransitionPainterOptions } from "./transitionPainterOptions.type";

// Le peintre de chaque transition, créé au début de la transition aux dimensions de l'écran
export const transitionPainters: Record<
	TransitionEffectEnum,
	(options: TransitionPainterOptions) => TransitionPainter
> = {
	[TransitionEffectEnum.Hex]: createHexPainter,
	[TransitionEffectEnum.Hexes]: createHexesPainter,
	[TransitionEffectEnum.Tiles]: createTilesPainter,
	[TransitionEffectEnum.Tram]: createTramPainter,
	[TransitionEffectEnum.Fire]: createFirePainter,
};
