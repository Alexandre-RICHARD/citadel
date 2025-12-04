import { NavLink } from "react-router";

import type { ProjectDictionnary } from "../../../appNavigation/projectDictionnary.type";
import styles from "./projectsShowcase.module.scss";

type Props = {
	projects: ProjectDictionnary[];
};

export function ProjectsShowcase({ projects }: Props) {
	return (
		<div className={styles.projects}>
			{projects.map((project, index) => (
				<NavLink
					to={project.path}
					key={project.buildPath}
					className={styles.project}
					style={{ transform: `translateX(${index * 60}rem)` }}
				>
					<div className={styles.inner}>
						<div className={styles.textBlock}>
							<h2>{project.name}</h2>
							<p>{project.description}</p>
						</div>

						<div className={styles.icon}>
							<img
								src={project.favicon}
								alt=""
							/>
						</div>
					</div>
				</NavLink>
			))}
		</div>
	);
}
