import { Outlet } from "react-router";

import { ReturnToHomepageButton } from "../../../../react/appNavigation/ReturnToHomepageButton.tsx";
import styles from "./testLayout.module.scss";

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
