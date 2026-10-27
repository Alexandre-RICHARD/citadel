import { ColorSchemeEnum } from "./colorScheme.enum";
import { darkColorSchemeQuery } from "./darkColorSchemeQuery";

export function getSystemColorScheme(): ColorSchemeEnum {
	return window.matchMedia(darkColorSchemeQuery).matches
		? ColorSchemeEnum.Dark
		: ColorSchemeEnum.Light;
}
