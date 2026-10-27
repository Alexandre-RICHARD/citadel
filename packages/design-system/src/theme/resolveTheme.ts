import { ColorSchemeEnum } from "./colorScheme/colorScheme.enum";
import { defaultDarkColors } from "./defaultDarkColors";
import { defaultTheme } from "./defaultTheme";
import type { ThemeType } from "./theme.type";
import type { ThemeDefinitionType } from "./themeDefinition.type";

// Le thème complet d'un projet dans un mode : la base du design system, puis ce que le projet surcharge
export function resolveTheme(
	definition: ThemeDefinitionType,
	colorScheme: ColorSchemeEnum,
): ThemeType {
	return {
		...defaultTheme,
		...(colorScheme === ColorSchemeEnum.Dark && defaultDarkColors),
		...definition.shared,
		...definition.colors[colorScheme],
	};
}
