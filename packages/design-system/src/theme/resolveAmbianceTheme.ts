import type { ColorSchemeEnum } from "./colorScheme/colorScheme.enum";
import { resolveTheme } from "./resolveTheme";
import type { ThemeType } from "./theme.type";
import type { ThemeDefinitionType } from "./themeDefinition.type";

// L'ambiance d'un projet dans un mode : son thème, puis ce que son ambiance force par-dessus
export function resolveAmbianceTheme(
	definition: ThemeDefinitionType,
	colorScheme: ColorSchemeEnum,
): ThemeType {
	return {
		...resolveTheme(definition, colorScheme),
		...definition.ambiance?.shared,
		...definition.ambiance?.colors?.[colorScheme],
	};
}
