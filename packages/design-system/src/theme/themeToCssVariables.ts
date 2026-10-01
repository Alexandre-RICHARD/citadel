import type { ThemeType } from "./theme.type";

export type CssVariableName = `--${string}`;

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
