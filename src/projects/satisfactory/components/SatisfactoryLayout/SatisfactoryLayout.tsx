import { Outlet } from "react-router";

import { Navigation } from "../Navigation/Navigation";

export function SatisfactoryLayout() {
	return (
		<>
			<Navigation />
			<Outlet />
		</>
	);
}
