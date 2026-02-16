import { Route, Routes } from "react-router";

import { AppContainer } from "../AppContainer";
import { SatisfactoryHomepage } from "./pages/SatisfactoryHomepage/SatisfactoryHomepage";
import { SatisfactoryLayout } from "./pages/SatisfactoryLayout/SatisfactoryLayout";
import { SatisfactoryRecipeList } from "./pages/SatisfactoryRecipeList/SatisfactoryRecipeList";

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
						path="recipe"
						element={<SatisfactoryRecipeList />}
					/>
				</Route>
			</Routes>
		</AppContainer>
	);
}
