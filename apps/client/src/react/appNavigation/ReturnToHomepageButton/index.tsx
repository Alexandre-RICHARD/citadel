import { useNavigate } from "react-router";

import { Button } from "../../../common/components/components/atoms/Button/index.tsx";
import { projects } from "../projects.dictionnary.ts";
import { ProjectsEnum } from "../projects.enum.ts";
import styles from "./returnToHomepageButton.module.scss";

export function ReturnToHomepageButton() {
	const navigate = useNavigate();
	const handleReturnToHomepageClick = () => {
		void navigate(projects[ProjectsEnum.Homepage].path);
	};

	return (
		<div className={styles.returnToHomepageButtonContainer}>
			<Button
				label="🏠"
				onClick={handleReturnToHomepageClick}
			/>
		</div>
	);
}
