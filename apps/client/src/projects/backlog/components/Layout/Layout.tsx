import { LucideProvider } from "lucide-react";
import { useEffect } from "react";
import { Outlet } from "react-router";

import { ProjectsEnum } from "../../../../react/appNavigation/projects.enum";
import { AppToaster } from "../../../../react/AppToaster";
import { ProjectThemeProvider } from "../../../../react/projectTheme/ProjectThemeProvider";
import { QueryErrorBoundary } from "../../../../react/QueryErrorBoundary";
import { backlogErrorReasons } from "../../api/backlogErrorReasons";
import styles from "../../backlog.module.scss";

const ICON_SIZE = 16;
const ICON_STROKE_WIDTH = 1.9;

export function Layout() {
	// Le thème du backlog (clair ou sombre) habille toute la page, panneaux en portail compris
	useEffect(() => {
		const root = document.documentElement;
		root.classList.add(styles.themeRoot ?? "");
		return () => root.classList.remove(styles.themeRoot ?? "");
	}, []);

	return (
		<ProjectThemeProvider project={ProjectsEnum.Backlog}>
			<LucideProvider
				size={ICON_SIZE}
				strokeWidth={ICON_STROKE_WIDTH}
			>
				{/* Dernier filet : une erreur qu'aucune zone n'a attrapée remplace la page, pas toute l'application */}
				<QueryErrorBoundary
					actionLabel="afficher la page"
					errorReasons={backlogErrorReasons}
				>
					<Outlet />
				</QueryErrorBoundary>
			</LucideProvider>
			<AppToaster />
		</ProjectThemeProvider>
	);
}
