import { Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer.tsx";
import { Layout } from "./components/Layout/Layout.tsx";
import { Homepage } from "./pages/Homepage/index.tsx";

export function GameDeathCounter() {
	return (
		<AppContainer>
			<Routes>
				<Route
					path=""
					element={<Layout />}
				>
					<Route
						index
						element={<Homepage />}
					/>
				</Route>
			</Routes>
		</AppContainer>
	);
}
