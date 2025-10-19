import { NavLink, Outlet } from "react-router";

import { projects } from "../projects/projects.dictionnary";
import { useNavigation } from "./useNavigation";

export function Navigation() {
	useNavigation();

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "2rem",
				margin: "1rem",
			}}
		>
			<p>Navigation</p>
			<nav style={{ display: "flex", gap: "1rem" }}>
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
