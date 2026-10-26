import { ThemeProvider } from "@citadel/design-system/src/theme/ThemeProvider";
import { LucideProvider } from "lucide-react";
import { useEffect } from "react";
import { Outlet } from "react-router";

import { AppToaster } from "../../../../react/AppToaster";
import { QueryErrorBoundary } from "../../../../react/QueryErrorBoundary";
import { backlogErrorReasons } from "../../api/backlogErrorReasons";
import styles from "../../backlog.module.scss";
import { backlogTheme } from "../../theme";

const ICON_SIZE = 16;
const ICON_STROKE_WIDTH = 1.9;

export function Layout() {
	// Le thème du backlog (clair ou sombre selon le système) habille toute la page, panneaux en portail compris
	useEffect(() => {
		const root = document.documentElement;
		root.classList.add(styles.themeRoot ?? "");
		return () => root.classList.remove(styles.themeRoot ?? "");
	}, []);

	return (
		<ThemeProvider theme={backlogTheme}>
			<LucideProvider
				size={ICON_SIZE}
				strokeWidth={ICON_STROKE_WIDTH}
			>
				{/* Inter, la police de l'interface : React la place dans <head> */}
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin=""
				/>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,400..700;1,14..32,400..700&display=swap"
					precedence="default"
				/>
				{/* Dernier filet : une erreur qu'aucune zone n'a attrapée remplace la page, pas toute l'application */}
				<QueryErrorBoundary
					actionLabel="afficher la page"
					errorReasons={backlogErrorReasons}
				>
					<Outlet />
				</QueryErrorBoundary>
			</LucideProvider>
			<AppToaster />
		</ThemeProvider>
	);
}
