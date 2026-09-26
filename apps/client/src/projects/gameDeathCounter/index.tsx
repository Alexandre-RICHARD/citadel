import { Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer";
import { Layout } from "./components/Layout/Layout";
import { Homepage } from "./pages/Homepage";

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
