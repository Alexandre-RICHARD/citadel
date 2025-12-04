import { AppContainer } from "../AppContainer";
import { projects } from "../appNavigation/projects.dictionnary";
import { Footer } from "./components/footer/Footer";
import { Header } from "./components/header/Header";
import { ProjectsShowcase } from "./components/projectsShowcase/ProjectsShowcase";
import styles from "./Homepage.module.scss";

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
