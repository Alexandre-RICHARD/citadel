import { Outlet } from "react-router";

import { ReturnToHomepageButton } from "../../../appNavigation/ReturnToHomepageButton.tsx";
import styles from "./testLayout.module.scss";

export function TestLayout() {
	return (
		<>
			<ReturnToHomepageButton />
			<div className={styles.testContainer}>
				<Outlet />
			</div>
		</>
	);
}
