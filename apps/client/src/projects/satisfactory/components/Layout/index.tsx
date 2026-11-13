import { Outlet } from "react-router";

import { ProjectsEnum } from "../../../../react/appNavigation/projects.enum";
import { ProjectThemeProvider } from "../../../../react/projectTheme/ProjectThemeProvider";
import { Navigation } from "../Navigation";
import styles from "./layout.module.scss";

export function Layout() {
	return (
		<ProjectThemeProvider project={ProjectsEnum.Satisfactory}>
			<div className={styles.satisfctoryLayout}>
				<Navigation>
					<Outlet />
				</Navigation>
			</div>
		</ProjectThemeProvider>
	);
}
