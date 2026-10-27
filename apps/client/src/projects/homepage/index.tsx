import { Navigate, Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer";
import { Layout } from "./components/Layout/Layout";
import { buildHomepagePath } from "./routing/buildHomepagePath";

// /homepage, /homepage/<projet> (projet sélectionné), /homepage/<page du footer>
export function Homepage() {
	return (
		<AppContainer>
			<Routes>
				<Route
					path=":slug?"
					element={<Layout />}
				/>
				<Route
					path="*"
					element={
						<Navigate
							to={buildHomepagePath()}
							replace
						/>
					}
				/>
			</Routes>
		</AppContainer>
	);
}
