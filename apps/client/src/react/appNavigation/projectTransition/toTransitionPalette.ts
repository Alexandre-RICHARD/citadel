import type { ThemeType } from "@citadel/design-system/src/theme/theme.type";

import type { TransitionPalette } from "./transitionPalette.type";

export function toTransitionPalette(theme: ThemeType): TransitionPalette {
	return {
		background: theme.colorBackground,
		accent: theme.colorPrimaryHue,
		decorations: [
			theme.colorDecoration1,
			theme.colorDecoration2,
			theme.colorDecoration3,
			theme.colorDecoration4,
		],
	};
}
