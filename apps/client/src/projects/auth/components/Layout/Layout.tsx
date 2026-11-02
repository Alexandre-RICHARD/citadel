import { ColorSchemeEnum } from "@citadel/design-system/src/theme/colorScheme/colorScheme.enum";
import { Castle, Moon, Sun } from "lucide-react";
import { Link, Outlet } from "react-router";

import { ProjectsEnum } from "../../../../react/appNavigation/projects.enum";
import { projects } from "../../../../react/appNavigation/projectsDictionary";
import { AppToaster } from "../../../../react/AppToaster";
import { ProjectThemeProvider } from "../../../../react/projectTheme/ProjectThemeProvider";
import { useProjectColorScheme } from "../../../../react/projectTheme/useProjectColorScheme";
import { QueryErrorBoundary } from "../../../../react/QueryErrorBoundary";
import { authErrorReasons } from "../../api/authErrorReasons";
import styles from "./layout.module.scss";

// Les pages du compte : le nom du site pour revenir à l'accueil et le choix clair ou sombre en haut, la page au centre,
// sur un fond aux couleurs de la Citadel
export function Layout() {
	const { colorScheme, toggleColorScheme } = useProjectColorScheme(
		ProjectsEnum.Auth,
	);
	const colorSchemeLabel = `Passer au thème ${colorScheme === ColorSchemeEnum.Dark ? "clair" : "sombre"}`;

	return (
		<ProjectThemeProvider project={ProjectsEnum.Auth}>
			<div className={styles.layout}>
				<div
					className={styles.backdrop}
					aria-hidden
				/>
				<header className={styles.header}>
					<Link
						to={projects[ProjectsEnum.Homepage].path}
						className={styles.brand}
					>
						<span className={styles.brandMark}>
							<Castle aria-hidden />
						</span>
						<span className={styles.brandName}>La Citadel d’Alex</span>
					</Link>
					<button
						type="button"
						className={styles.colorSchemeButton}
						onClick={toggleColorScheme}
						aria-label={colorSchemeLabel}
						title={colorSchemeLabel}
					>
						{colorScheme === ColorSchemeEnum.Dark ? (
							<Moon aria-hidden />
						) : (
							<Sun aria-hidden />
						)}
					</button>
				</header>
				<main className={styles.main}>
					{/* Dernier filet : une erreur qu'aucune page n'a attrapée remplace la page, pas toute l'application */}
					<QueryErrorBoundary
						actionLabel="afficher la page"
						errorReasons={authErrorReasons}
					>
						<Outlet />
					</QueryErrorBoundary>
				</main>
			</div>
			<AppToaster />
		</ProjectThemeProvider>
	);
}
