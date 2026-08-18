import { Route, Routes } from "react-router";

import { AppContainer } from "../../react/AppContainer";
import { Layout } from "./components/Layout";
import { Calculator } from "./pages/Calculator";
import { Homepage } from "./pages/Homepage";
import { Machines } from "./pages/Machines";
import { RecipeList } from "./pages/RecipeList";
import { Settings } from "./pages/Settings";

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
