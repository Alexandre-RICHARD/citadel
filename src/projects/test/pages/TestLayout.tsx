import { Outlet } from "react-router";

import { DefaultReturnToHomepageButton } from "../../appNavigation/defaultReturnToHomepageButton.tsx/DefaultReturnToHomepageButton";
import styles from "./testLayout.module.scss";

export function TestLayout() {
	return (
		<>
			<DefaultReturnToHomepageButton />
			<div className={styles.testContainer}>
				<Outlet />
			</div>
		</>
	);
}
