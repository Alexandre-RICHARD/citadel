import { BackgroundEffectEnum } from "../../../../react/appNavigation/showcase/backgroundEffect.enum";
import type { BackgroundEffect } from "./backgroundEffect.type";
import { createEmbersEffect } from "./createEmbersEffect";
import { createHexGridEffect } from "./createHexGridEffect";
import { createShapesEffect } from "./createShapesEffect";
import { createStripesEffect } from "./createStripesEffect";

export const backgroundEffectFactories: Record<
	BackgroundEffectEnum,
	() => BackgroundEffect
> = {
	[BackgroundEffectEnum.Embers]: createEmbersEffect,
	[BackgroundEffectEnum.Shapes]: createShapesEffect,
	[BackgroundEffectEnum.Stripes]: createStripesEffect,
	[BackgroundEffectEnum.HexGrid]: createHexGridEffect,
};
