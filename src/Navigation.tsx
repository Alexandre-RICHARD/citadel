import { NavLink, Outlet } from "react-router";

import { projects } from "./projects/projects.dictionnary";

export function Navigation() {
	return (
		<>
			<p>Navigation</p>
			<nav>
				{Object.values(projects).map((route) => (
					<NavLink to={route.path}>{route.name}</NavLink>
				))}
			</nav>
			<Outlet />
		</>
	);
}
