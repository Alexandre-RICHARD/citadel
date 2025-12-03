import { NavLink, Outlet } from "react-router";

import { projects } from "../projects.dictionnary";
import styles from "./appNavigation.module.scss";
import { useAppNavigation } from "./useAppNavigation";

export function AppNavigation() {
	useAppNavigation();

	return (
		<div className={styles.appNavigationContainer}>
			<p>Navigation</p>
			<nav className={styles.navigationItemBox}>
				{Object.values(projects).map((route) => (
					<NavLink
						key={route.name}
						to={route.path}
					>
						{route.name}
					</NavLink>
				))}
			</nav>
			<Outlet />
		</div>
	);
}
