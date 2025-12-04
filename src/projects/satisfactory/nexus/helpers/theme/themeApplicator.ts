import type { ThemeType } from "../../nexusExporter";

export const themeApplicator = (theme: ThemeType) => {
	const root = document.documentElement;

	Object.entries(theme).forEach(([variable, value]) => {
		root.style.setProperty(`--theme-${variable}`, value);
	});
};
