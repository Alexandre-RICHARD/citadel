import { Outlet } from "react-router";

import { ReturnToHomepageButton } from "../../../../react/appNavigation/ReturnToHomepageButton/index.tsx";
import styles from "./layout.module.scss";

export function Layout() {
	return (
		<>
			<ReturnToHomepageButton />
			<div className={styles.testContainer}>
				<Outlet />
			</div>
		</>
	);
}
