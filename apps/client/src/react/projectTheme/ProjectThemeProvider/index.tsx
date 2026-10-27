import { resolveTheme } from "@citadel/design-system/src/theme/resolveTheme";
import { ThemeProvider } from "@citadel/design-system/src/theme/ThemeProvider";
import { useDocumentTheme } from "@citadel/design-system/src/theme/useDocumentTheme";
import { type ReactNode, useMemo } from "react";

import type { ProjectsEnum } from "../../appNavigation/projects.enum";
import { projects } from "../../appNavigation/projectsDictionary";
import { useProjectColorScheme } from "../useProjectColorScheme";

type Props = {
	project: ProjectsEnum;
	children: ReactNode;
};

// Le thème du projet, dans le mode choisi : sur ses composants, sur <html> (portails, fond de la page), et ses polices
export function ProjectThemeProvider({ project, children }: Props) {
	const { colorScheme } = useProjectColorScheme(project);
	const definition = projects[project].theme;
	const theme = useMemo(
		() => resolveTheme(definition, colorScheme),
		[definition, colorScheme],
	);

	useDocumentTheme(theme, colorScheme);

	return (
		<ThemeProvider theme={theme}>
			{/* React les place dans <head>, une seule fois même si plusieurs composants les demandent */}
			<link
				rel="preconnect"
				href="https://fonts.gstatic.com"
				crossOrigin=""
			/>
			<link
				rel="stylesheet"
				href={definition.fontStylesheet}
				precedence="default"
			/>
			{children}
		</ThemeProvider>
	);
}
