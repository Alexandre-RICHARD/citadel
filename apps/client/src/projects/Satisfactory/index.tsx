import { Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer.tsx";
import { Layout } from "./components/Layout/index.tsx";
import { Calculator } from "./pages/Calculator/index.tsx";
import { Homepage } from "./pages/Homepage/index.tsx";
import { Machines } from "./pages/Machines/index.tsx";
import { RecipeList } from "./pages/RecipeList/index.tsx";
import { Settings } from "./pages/Settings/index.tsx";

export function Satisfactory() {
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
					<Route
						path="recipes"
						element={<RecipeList />}
					/>
					<Route
						path="calculator"
						element={<Calculator />}
					/>
					<Route
						path="frm/allMachines"
						element={<Machines />}
					/>
					<Route
						path="settings"
						element={<Settings />}
					/>
				</Route>
			</Routes>
		</AppContainer>
	);
}
