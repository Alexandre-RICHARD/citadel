import { Route, Routes } from "react-router";

import { AppContainer } from "../AppContainer";
import { SatisfactoryLayout } from "./components/SatisfactoryLayout/SatisfactoryLayout";
import { SatisfactoryCalculator } from "./pages/SatisfactoryCalculator/SatisfactoryCalculator";
import { SatisfactoryHomepage } from "./pages/SatisfactoryHomepage/SatisfactoryHomepage";
import { SatisfactoryMachines } from "./pages/SatisfactoryMachines/SatisfactoryMachines";
import { SatisfactoryRecipeList } from "./pages/SatisfactoryRecipeList/SatisfactoryRecipeList";
import { SatisfactorySettings } from "./pages/SatisfactorySettings/SatisfactorySettings";

export function SatisfactoryPage() {
	return (
		<AppContainer>
			<Routes>
				<Route
					path=""
					element={<SatisfactoryLayout />}
				>
					<Route
						index
						element={<SatisfactoryHomepage />}
					/>
					<Route
						path="recipes"
						element={<SatisfactoryRecipeList />}
					/>
					<Route
						path="calculator"
						element={<SatisfactoryCalculator />}
					/>
					<Route
						path="frm/allMachines"
						element={<SatisfactoryMachines />}
					/>
					<Route
						path="settings"
						element={<SatisfactorySettings />}
					/>
				</Route>
			</Routes>
		</AppContainer>
	);
}
