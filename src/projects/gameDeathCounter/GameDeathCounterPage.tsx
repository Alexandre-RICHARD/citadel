import { Route, Routes } from "react-router";

import { AppContainer } from "../AppContainer";
import { GameDeathCounterLayout } from "./components/GameDeathCounterLayout/GameDeathCounterLayout";
import { GameDeathCounterHomepage } from "./pages/GameDeathCounterHomepage/GameDeathCounterHomepage";

export function GameDeathCounterPage() {
	return (
		<AppContainer>
			<Routes>
				<Route
					path=""
					element={<GameDeathCounterLayout />}
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
