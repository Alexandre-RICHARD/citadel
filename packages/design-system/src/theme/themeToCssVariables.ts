import type { CssVariableName } from "./cssVariableName.type";
import type { ThemeType } from "./theme.type";

export function themeToCssVariables(
	theme: Partial<ThemeType>,
): Record<CssVariableName, string> {
	return Object.fromEntries(
		Object.entries(theme).map(([tokenName, value]) => [
			`--theme-${tokenName}`,
			value,
		]),
	);
}
