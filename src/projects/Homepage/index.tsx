import { AppContainer } from "../../react/AppContainer.tsx";
import { projects } from "../../react/appNavigation/projects.dictionnary.ts";
import { Footer } from "./Footer/index.tsx";
import { Header } from "./Header/index.tsx";
import styles from "./homepage.module.scss";
import { ProjectsShowcase } from "./ProjectsShowcase/index.tsx";

export function Homepage() {
	const projectsInList = Object.values(projects);

	return (
		<AppContainer>
			<div className={styles.homepage}>
				<Header />
				<ProjectsShowcase projects={projectsInList} />
				<Footer />
			</div>
		</AppContainer>
	);
}
