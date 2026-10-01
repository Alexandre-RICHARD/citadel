import type { CSSProperties, ReactNode } from "react";

import type { ThemeType } from "../theme.type";
import {
	type CssVariableName,
	themeToCssVariables,
} from "../themeToCssVariables";
import styles from "./themeProvider.module.scss";

type Props = {
	// À la racine : le thème complet. Imbriqué : seulement les valeurs à surcharger, le reste est hérité
	theme: Partial<ThemeType>;
	// Variables propres à une partie de l'app, absentes du thème
	customVariables?: Record<CssVariableName, string>;
	children: ReactNode;
};

export function ThemeProvider({ theme, customVariables, children }: Props) {
	const cssVariables = {
		...themeToCssVariables(theme),
		...customVariables,
	} as CSSProperties;

	return (
		<div
			className={styles.themeProvider}
			style={cssVariables}
		>
			{children}
		</div>
	);
}
