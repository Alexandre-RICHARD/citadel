import { Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer";
import { Layout } from "./components/Layout/Layout";
import { GameDeathCounterHomepage } from "./pages/GameDeathCounterHomepage/GameDeathCounterHomepage";

export function GameDeathCounterPage() {
	return (
		<AppContainer>
			<Routes>
				<Route
					path=""
					element={<Layout />}
				>
					<Route
						index
						element={<GameDeathCounterHomepage />}
					/>
				</Route>
			</Routes>
		</AppContainer>
	);
}
